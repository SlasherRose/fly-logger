const Errors = require("./errors");
const instances = {};

function FlyFactory(id, settings = {}) {
	if (!id) {
		throw Errors.NoIdGiven();
	}
	if (instances[id]) {
		throw Errors.IdAlreadyExists(id);
	}
	const userSettings = { ...settings };

	setDefaultLogLevels();

	const fullSettings = { ...defaults, ...userSettings };

	validateLevels(fullSettings.levels);

	autoDetectFileName();

	const instance = new FlyInstance(id, fullSettings);

	instances[id] = instance;

	return instance;

	function setDefaultLogLevels() {
		if (userSettings.levels) {
			if (shouldKeepDefaultLevels()) {
				userSettings.levels = {
					...defaults.levels,
					...userSettings.levels,
				};
			}
		} else {
			userSettings.levels = defaults.levels;
		}
	}

	function shouldKeepDefaultLevels() {
		return userSettings.keepDefaultLevels === undefined
			? defaults.keepDefaultLevels
			: userSettings.keepDefaultLevels;
	}

	function autoDetectFileName() {
		if (fullSettings.autoDetectFileName && !fullSettings.fileName) {
			const stack = new Error().stack;
			const matches = stack.match(/(?<=\\)[^\\]*?(?=:)/g);
			let fileName = "[undetectable]";
			if (matches && matches.length > 1) {
				fileName = matches[2];
			}
			fullSettings.fileName = fileName;
		}

		if (!fullSettings.autoDetectFileName && !fullSettings.fileName) {
			fullSettings.fileName = "[none]";
		}
	}

	function validateLevels(levels) {
		const allLevelValues = Object.values(levels).map((level) => level.value);

		if (allLevelValues.length < 1) {
			throw Errors.NoLevelsDefined(id);
		}

		const duplicates = allLevelValues.filter(
			(value, index, self) => self.indexOf(value) !== index
		);
		if (duplicates.length > 0) {
			throw Errors.DuplicateLevelValuesFound(id, duplicates);
		}
	}
}

class FlyInstance {
	constructor(id, settings) {
		this.id = id;
		this.settings = { ...settings };

		for (const level in this.settings.levels) {
			this[level] = (...msgs) => {
				const lvl = this.settings.levels[level];
				return this.speak(
					lvl.value,
					lvl.forceCaps,
					lvl.defaultColor || this.settings.defaultMessageColor,
					...msgs
				);
			};
		}

		// ensure that thresholdLevel is valid if it is given as a string
		if (this.settings.thresholdLevel !== 0) {
			const thresholdLevel = this.settings.thresholdLevel;
			if (typeof thresholdLevel === "string") {
				const findThreshold = this.settings.levels[thresholdLevel];
				if (!findThreshold) {
					throw Errors.InvalidThresholdLevel(id, thresholdLevel);
				}
			}
		}
	}
	speak(levelValue, forceCaps, defaultColor, ...msgs) {
		const thresholdLevel = checkThreshLevel(
			this.settings.thresholdLevel,
			this.settings.levels,
			this.id
		);
		if (levelValue < thresholdLevel) {
			return DeadFly;
		}

		const myTags = [];
		let previousColor = defaultColor;
		let myColor = defaultColor;
		const LogOptions = {
			out: () => {
				if (!isAllowed(this.id, this.settings.fileName, myTags)) {
					return;
				}
				const levelName = Object.keys(this.settings.levels).find(
					(key) => this.settings.levels[key].value === levelValue
				);
				return out(this.id, myColor, forceCaps, myTags, levelName, msgs);
			},
			if: (condition) => {
				if (condition) {
					return LogOptions;
				}
				return DeadFly;
			},
			tag: (tag) => {
				myTags.push(tag);
				return {
					...LogOptions,
					if(condition) {
						if (condition) {
							return LogOptions;
						}
						myTags.pop();
						return LogOptions;
					},
				};
			},
			color: (color) => {
				if (!color) {
					console.warn("No color provided (using default)");
					color = this.settings.defaultMessageColor;
				}
				previousColor = myColor;
				myColor = color;
				return {
					...LogOptions,
					if(condition) {
						if (condition) {
							return LogOptions;
						}
						const hold = previousColor;
						previousColor = myColor;
						myColor = hold;
						return LogOptions;
					},
				};
			},
		};

		function checkThreshLevel(thresholdLevel, levels, id) {
			if (typeof thresholdLevel === "string") {
				const findThreshold = levels[thresholdLevel];
				if (!findThreshold) {
					throw Errors.InvalidThresholdLevel(id, thresholdLevel);
				}
				thresholdLevel = levels[thresholdLevel].value;
			}
			return thresholdLevel;
		}

		const isAllowed = (id, file, tags) => {
			const logAttributes = {
				id,
				file,
				tags,
			};

			if (this.settings.whitelist && this.settings.whitelist.length > 0) {
				return lookForFilteredValues(
					this.settings.whitelist,
					logAttributes
				);
			}
			if (this.settings.blacklist && this.settings.blacklist.length > 0) {
				return !lookForFilteredValues(
					this.settings.blacklist,
					logAttributes
				);
			}
			return true;
		};

		function out(id, msgColor, forceCaps, tags, level, msgs) {
			const me = instances[id];
			const settings = me.settings;
			const fileName = me.settings.fileName;
			const printOrder = settings.printOrder;

			if (!msgs || msgs.length < 1) {
				console.warn("Logger has no messages");
				return null;
			}

			msgs = processMessages(msgs, forceCaps);

			const logOutput = [];

			createPrintOrder(logOutput);

			return out(logOutput);

			function getColor(sectionName) {
				if (settings.noColors) {
					return "";
				}
				const colorName = settings[`default${sectionName}Color`];
				if (!colorName) {
					return Color(settings.defaultColor);
				}
				return Color(colorName);
			}

			function processMessages(msgs, forceCaps) {
				if (!msgs) {
					return msgs;
				}
				if (typeof msgs === "string") {
					return [msgs];
				}
				const processed = msgs.map((msg) => {
					// check if msg is a warning
					if (msg instanceof Error) {
						msg = msg.message;
					} else if (typeof msg === "object") {
						try {
							msg = JSON.stringify(msg);
						} catch (e) {
							console.warn("unable to stringify message");
							return msg;
						}
					} else if (msg === null) {
						msg = "null";
					} else if (msg === undefined) {
						msg = "undefined";
						// if message is all white space
					} else if (typeof msg === "string" && msg.match(/^\s*$/)) {
						msg = "''";
					}
					return msg;
				});
				if (forceCaps) {
					return processed.map((msg) => msg.toUpperCase());
				}
				return processed;
			}

			function createPrintOrder(logOutput) {
				const resetColor = settings.noColors ? "" : Colors.RESET;
				printOrder.forEach((sectionName) => {
					sectionName =
						sectionName.charAt(0).toUpperCase() + sectionName.slice(1); // force first letter to be uppercase
					const color = getColor(sectionName);
					const printSection = me.settings[`print${sectionName}`];
					if (!printSection && sectionName !== "Message") {
						return;
					}
					const label = settings.printLabels ? `${sectionName}: ` : "";
					switch (sectionName) {
						case "FileName":
							logOutput.push(`${label}${color}${fileName}${resetColor}`);
							break;
						case "Id":
							logOutput.push(`${label}${color}${id}${resetColor}`);
							break;
						case "Level":
							logOutput.push(`${label}${color}${level}${resetColor}`);
							break;
						case "Tags":
							if (tags.length > 0) {
								logOutput.push(
									`${label}${color}[${tags.join(
										settings.tagDelimiter
									)}]${Colors.RESET}`
								);
							}
							break;
						case "Message":
							msgColor = settings.noColors ? "" : Color(msgColor);
							logOutput.push(
								`${label}${msgColor}${smartMessageJoin(
									msgs
								)}${resetColor}`
							);
							break;
					}
				});
			}

			function out(logOutput) {
				const outputString = logOutput.join(settings.logDelimiter);
				console.log(outputString);

				if (settings.allowStringReturn) {
					return outputString;
				}
			}

			function smartMessageJoin(msgs) {
				const wrappedCharacters = new RegExp(/["'()[\]{}\s]$/);
				const punctuation = new RegExp(/[.,;:!?]$/);
				const joined = msgs.map((msg, i) => {
					if (i === msgs.length - 1) {
						return msg;
					}
					if (i === 0) {
						if (msgs.length === 1) {
							return msg;
						}

						const currentMessageEndsWithWrapped =
							typeof msg === "string" &&
							msg.length > 0 &&
							msg[msg.length - 1].match(wrappedCharacters) !== null;
						const currentMessageEndsWithPunctuation =
							typeof msg === "string" &&
							msg.length > 0 &&
							msg[msg.length - 1].match(punctuation) !== null;
						if (currentMessageEndsWithWrapped) {
							return msg;
						}
						return msg + " ";
					}
					const nextMsg = msgs[i + 1];
					const nextMsgStartsWithWrapped =
						typeof nextMsg === "string" &&
						nextMsg.length > 0 &&
						nextMsg[0].match(wrappedCharacters) !== null;
					const nextMsgStartsWithPunctuation =
						typeof nextMsg === "string" &&
						nextMsg.length > 0 &&
						nextMsg[0].match(punctuation) !== null;
					const currentMessageEndsWithWrapped =
						typeof msg === "string" &&
						msg.length > 0 &&
						msg[msg.length - 1].match(wrappedCharacters) !== null;
					const currentMessageEndsWithPunctuation =
						typeof msg === "string" &&
						msg.length > 0 &&
						msg[msg.length - 1].match(punctuation) !== null;

					if (
						nextMsgStartsWithWrapped ||
						nextMsgStartsWithPunctuation ||
						currentMessageEndsWithWrapped ||
						currentMessageEndsWithPunctuation
					) {
						return msg;
					}
					return msg + " ";
				});
				return joined.join("");
			}
		}

		return LogOptions;
	}
	kill() {
		delete instances[this.id];
		this.log = (...msgs) => DeadFly;
		this.id = null;
		this.settings = null;
	}
}

const DeadFly = {
	out: () => {},
	if: () => DeadFly,
	tag: () => DeadFly,
	color: () => DeadFly,
};

function lookForFilteredValues(blackOrWhiteList, logAttributes) {
	if (!blackOrWhiteList || blackOrWhiteList.length < 1) {
		return false;
	}
	if (!logAttributes) {
		return false;
	}

	for (const blackOrWhiteListedObject of blackOrWhiteList) {
		let match = false;
		for (let attribute in blackOrWhiteListedObject) {
			if (attribute === "tag") {
				const transferTag = blackOrWhiteListedObject[attribute];
				attribute = "tags";
				blackOrWhiteListedObject[attribute] = transferTag;
				delete blackOrWhiteListedObject.tag;
			}
			const objHasTriggeredFilter = isFiltered(
				blackOrWhiteListedObject[attribute],
				logAttributes[attribute]
			);
			match = objHasTriggeredFilter;
			if (!match) {
				break;
			}
		}
		if (match) {
			return true;
		}
	}
	return false;

	function isFiltered(listToMatchAgainst, objectBeingSearched) {
		if (
			typeof listToMatchAgainst === "string" &&
			typeof objectBeingSearched === "string"
		) {
			return listToMatchAgainst === objectBeingSearched;
		}

		if (
			typeof listToMatchAgainst === "string" &&
			Array.isArray(objectBeingSearched)
		) {
			return objectBeingSearched.includes(listToMatchAgainst);
		}

		if (Array.isArray(listToMatchAgainst)) {
			if (Array.isArray(listToMatchAgainst)) {
				return listToMatchAgainst.every((element) =>
					objectBeingSearched.includes(element)
				);
			} else {
				return objectBeingSearched.includes(listToMatchAgainst);
			}
		}

		return false;
	}
}

function Color(colorString) {
	if (!colorString) {
		console.warn("No color provided (using default color)");
		return Colors[defaults.defaultMessageColor];
	}

	if (typeof colorString !== "string") {
		console.warn("Color must be a string (using default color)");
		return Colors[defaults.defaultMessageColor];
	}

	colorString = colorString.toUpperCase();

	const color = Colors[colorString];
	if (!color) {
		if (colorString.match(/^[\u001b]/)) {
			colorString = "{ColorObject}";
		}
		console.warn("Color not found:", colorString, "(using default color)");
		return Colors[defaults.defaultMessageColor];
	}
	return color;
}

class LogLevel {
	constructor({ value, defaultColor, forceCaps = false }) {
		this.value = value;
		this.defaultColor = defaultColor;
		this.forceCaps = forceCaps;
	}
}

const defaults = {
	fileName: null,
	autoDetectFileName: true,
	noColors: false,
	defaultMessageColor: "BLUE",
	defaultFileNameColor: "CYAN",
	defaultIdColor: "MAGENTA",
	defaultLevelColor: "YELLOW",
	defaultTagsColor: "GREEN",

	levels: {
		trace: new LogLevel({ value: 10 }),
		debug: new LogLevel({ value: 100 }),
		log: new LogLevel({ value: 200 }),
		info: new LogLevel({ value: 300 }),
		warn: new LogLevel({ value: 400, defaultColor: "YELLOW" }),
		error: new LogLevel({ value: 500, defaultColor: "RED" }),
		critical: new LogLevel({
			value: 1000,
			defaultColor: "RED",
			forceCaps: true,
		}),
	},
	keepDefaultLevels: true,
	thresholdLevel: 0,

	allowStringReturn: true,

	printTags: true,
	printLevel: false,
	printFileName: true,
	printId: true,
	printLabels: true,
	printOrder: ["fileName", "id", "message", "level", "tags"],

	logDelimiter: "; ",
	tagDelimiter: ", ",
};

function exterminate() {
	for (const id in instances) {
		instances[id].kill();
	}
}

module.exports = {
	Fly: FlyFactory,
	LogLevel,
	exterminate,
};

const Colors = {
	BLACK: "\u001b[30m",
	RED: "\u001b[31m",
	GREEN: "\u001b[32m",
	YELLOW: "\u001b[33m",
	BLUE: "\u001b[34m",
	MAGENTA: "\u001b[35m",
	CYAN: "\u001b[36m",
	WHITE: "\u001b[37m",
	RESET: "\u001b[0m",
	LIGHT_BLACK: "\u001b[90m",
	LIGHT_RED: "\u001b[91m",
	LIGHT_GREEN: "\u001b[92m",
	LIGHT_YELLOW: "\u001b[93m",
	LIGHT_BLUE: "\u001b[94m",
	LIGHT_MAGENTA: "\u001b[95m",
	LIGHT_CYAN: "\u001b[96m",
	LIGHT_WHITE: "\u001b[97m",
};
Object.freeze(Colors);
