import { Tests, assert } from "@slasherrose/check-up";
import { Fly, LogLevel, exterminate } from "fly-logging";
import Errors from "../src/module/errors.js";

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
};
let fly;

const testFlySettings = new Tests("Settings Test");
const id = "id";
const tag1 = "tag1";
const msg = "hello";
const testLevel = "log";
const fileName = "SettingsFile";

testFlySettings.onTestFinish(() => {
	exterminate();
});

testFlySettings.test("testSetSettingsSucceeds", () => {
	createFly({
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
	});

	let str;
	assert(() => {
		str = fly.log("hello").out();
	}).succeeds();
});

testFlySettings.test("testSetSettingsPrintOnlyTags", () => {
	const settings = {
		fileName: fileName,
		printTags: true,
		printLevel: false,
		printFileName: false,
		printId: false,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains(msg); // will always contain message
	assert(str).contains(tag1);
	assert(str).notContains(id);
	assert(str).notContains(testLevel);
	assert(str).notContains(fileName);
});

testFlySettings.test("testSetSettingsPrintOnlyLevel", () => {
	const settings = {
		fileName: fileName,
		printTags: false,
		printLevel: true,
		printFileName: false,
		printId: false,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains(msg); // will always contain message
	assert(str).notContains(tag1);
	assert(str).notContains(id);
	assert(str).contains(testLevel);
	assert(str).notContains(fileName);
});

testFlySettings.test("testSetSettingsPrintOnlyFileName", () => {
	const settings = {
		fileName: fileName,
		printTags: false,
		printLevel: false,
		printFileName: true,
		printId: false,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains(msg); // will always contain message
	assert(str).notContains(tag1);
	assert(str).notContains(id);
	assert(str).notContains(testLevel);
	assert(str).contains(fileName);
});

testFlySettings.test("testSetSettingsPrintOnlyId", () => {
	const settings = {
		fileName: fileName,
		printTags: false,
		printLevel: false,
		printFileName: false,
		printId: true,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains(msg); // will always contain message
	assert(str).notContains(tag1);
	assert(str).contains(id);
	assert(str).notContains(testLevel);
});

testFlySettings.test("testSetSettingsNoColors", () => {
	const settings = {
		noColors: true,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).notContains(Colors.BLUE);
	assert(str).notContains(Colors.CYAN);
	assert(str).notContains(Colors.MAGENTA);
	assert(str).notContains(Colors.YELLOW);
	assert(str).notContains(Colors.GREEN);
});

testFlySettings.test("testSetAutoDetectFileName", () => {
	const settings = {
		autoDetectFileName: true,
		fileName: undefined,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains("settings.test.js");
});

testFlySettings.test("testSetNoAutoDetectAndNoFileNameGiven", () => {
	const settings = {
		autoDetectFileName: false,
		fileName: undefined,
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains("[none]");
});

testFlySettings.test("testSetDefaultColors", () => {
	const settings = {
		fileName: fileName,
		printTags: true,
		printLevel: true,
		printFileName: true,
		printId: true,
		defaultMessageColor: "RED",
		defaultFileNameColor: "RED",
		defaultIdColor: "RED",
		defaultLevelColor: "RED",
		defaultTagsColor: "RED",
	};
	createFly(settings);

	let str = fly.log(msg).tag(tag1).out();
	assert(str).contains(Colors.RED + msg + Colors.RESET);
	assert(str).contains(Colors.RED + id + Colors.RESET);
	assert(str).contains(Colors.RED + testLevel + Colors.RESET);
	assert(str).contains(Colors.RED + `[${tag1}]` + Colors.RESET);
	assert(str).contains(Colors.RED + fileName + Colors.RESET);
});

testFlySettings.test("testCustomLevelsKeepDefaultLevels", () => {
	const settings = {
		fileName: fileName,
		keepDefaultLevels: true,
		levels: {
			foo: new LogLevel({ value: 12 }),
		},
	};
	createFly(settings);

	assert(fly.foo).isTruthy();
	assert(fly.bar).isFalsy();
	assert(fly.log).isTruthy();
});

testFlySettings.test("testCustomLevelsDontKeepDefaultLevels", () => {
	const settings = {
		fileName: fileName,
		keepDefaultLevels: false,
		levels: {
			foo: new LogLevel({ value: 12 }),
		},
	};
	createFly(settings);

	assert(fly.foo).isTruthy();
	assert(fly.bar).isFalsy();
	assert(fly.log).isFalsy();
});

testFlySettings.test("testThresholdLevelNumber", () => {
	const settings = {
		fileName: fileName,
		thresholdLevel: 50,
		keepDefaultLevels: false,
		levels: {
			foo: new LogLevel({ value: 10 }),
			thresh: new LogLevel({ value: 50 }),
			bar: new LogLevel({ value: 100 }),
		},
	};
	createFly(settings);

	const fooStr = fly.foo("foo").out();
	const barStr = fly.bar("bar").out();

	assert(fooStr).isFalsy();
	assert(barStr).isTruthy();
});

testFlySettings.test("testThresholdLevelString", () => {
	const settings = {
		fileName: fileName,
		thresholdLevel: "thresh",
		keepDefaultLevels: false,
		levels: {
			foo: new LogLevel({ value: 10 }),
			thresh: new LogLevel({ value: 50 }),
			bar: new LogLevel({ value: 100 }),
		},
	};
	createFly(settings);

	const fooStr = fly.foo("foo").out();
	const barStr = fly.bar("bar").out();

	assert(fooStr).isFalsy();
	assert(barStr).isTruthy();
});

testFlySettings.test("testThresholdLevelStringInvalid", () => {
	const settings = {
		fileName: fileName,
		thresholdLevel: "invalid",
		keepDefaultLevels: false,
		levels: {
			foo: new LogLevel({ value: 10 }),
			thresh: new LogLevel({ value: 50 }),
			bar: new LogLevel({ value: 100 }),
		},
	};

	assert(() => {
		createFly(settings);
	}).failsWithError(Errors.InvalidThresholdLevel(id, "invalid"));
});

testFlySettings.test("testAllowStringReturnFalse", () => {
	const settings = {
		fileName: fileName,
		allowStringReturn: false,
	};
	createFly(settings);

	const str = fly.log(msg).out();
	assert(str).isFalsy();
});

testFlySettings.test("testCustomPrintOrder", () => {
	const settings = {
		noColors: true, // to make testing easier
		fileName: fileName,
		printId: true,
		printLevel: true,
		printTags: true, // This will not print, because it is not given in the printOrder
		printOrder: ["id", "message", "level"],
	};
	createFly(settings);

	const str = fly.log(msg).out();
	assert(str).notContains(tag1);
	assert(str).contains("Id: id; Message: hello; Level: log");
});

testFlySettings.test("testLogDelimiter", () => {
	const settings = {
		fileName: fileName,
		printTags: false,
		printFileName: true,
		logDelimiter: " {||} ",
	};
	createFly(settings);

	const str = fly.log(msg).out();
	assert(str).contains(" {||} ");
});

testFlySettings.test("testTagDelimiter", () => {
	const settings = {
		fileName: fileName,
		printTags: true,
		tagDelimiter: " {//} ",
	};
	createFly(settings);

	const str = fly.log(msg).tag(tag1).tag("tag2").out();
	assert(str).contains(" {//} ");
});

testFlySettings.endTests();

function createFly(settings) {
	fly = new Fly(id, settings);
}
