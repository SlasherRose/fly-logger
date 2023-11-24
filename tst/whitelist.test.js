import { Tests, assert } from "@slasherrose/check-up";
import { Fly, LogLevel, exterminate } from "fly-logging";
let fly;

const testFlyWhitelist = new Tests("Whitelist Test");
const id = "id";
const tag1 = "tag1";
const tag2 = "tag2";
const msg = "hello";
const testLevel = "log";
const fileName = "WhitelistTest";

testFlyWhitelist.onTestFinish(() => {
	exterminate();
});

testFlyWhitelist.test("testEmptyWhitelist", () => {
	createFly({ whitelist: [] }); // does nothing

	let str;
	assert(() => {
		str = fly.log("hello").tag(tag1).out();
	}).succeeds();

	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistFileName", () => {
	const blackListJustFileName = [{ file: fileName }];
	createFly({ whitelist: blackListJustFileName });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistId", () => {
	const blackListJustId = [{ id: id }];
	createFly({ whitelist: blackListJustId });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistTagsOneString", () => {
	const blackListJustTag = [{ tags: tag1 }];
	createFly({ whitelist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistTagsOneArray", () => {
	const blackListJustTag = [{ tags: [tag1] }];
	createFly({ whitelist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistTagOneString", () => {
	const blackListJustTag = [{ tag: tag1 }];
	createFly({ whitelist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
});

testFlyWhitelist.test("testWhitelistBOTHTags", () => {
	const blackListBothTags = [{ tags: [tag1, tag2] }];
	createFly({ whitelist: blackListBothTags });
	const str = fly
		.log("1) this should be blacklisted")
		.tag(tag1)
		.tag(tag2)
		.out();
	const str2 = fly.log("2) this should be not blacklisted").tag(tag1).out();
	const str3 = fly.log("3) this should be not blacklisted").tag(tag2).out();
	const str4 = fly.log("4) this should be not blacklisted").out();
	assert(str).isTruthy();
	assert(str2).isFalsy();
	assert(str3).isFalsy();
	assert(str4).isFalsy();
});

testFlyWhitelist.test("testWhitelistEITHERTags", () => {
	const blackListEitherTags = [{ tags: [tag1] }, { tags: [tag2] }];
	createFly({ whitelist: blackListEitherTags });
	const str = fly
		.log("1) this should be blacklisted")
		.tag(tag1)
		.tag(tag2)
		.out();
	const str2 = fly.log("2) this should be blacklisted").tag(tag1).out();
	const str3 = fly.log("3) this should be blacklisted").tag(tag2).out();
	const str4 = fly.log("4) this should be not blacklisted").out();
	assert(str).isTruthy();
	assert(str2).isTruthy();
	assert(str3).isTruthy();
	assert(str4).isFalsy();
});

testFlyWhitelist.test("testWhitelistBOTHFilenameAndTags", () => {
	const blackListThisFile = [{ file: fileName, tag: [tag1] }];
	createFly({ whitelist: blackListThisFile });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isTruthy();

	fly = new Fly("anotherID", {
		fileName: "otherFile",
		whitelist: blackListThisFile,
	});
	const str2 = fly.log("this should be not blacklisted").tag(tag1).out();
	assert(str2).isFalsy();
});

testFlyWhitelist.test("testWhitelistEITHERFilenameOrTags", () => {
	const blackListThisFile = [{ file: fileName }, { tag: [tag1] }];
	createFly({ whitelist: blackListThisFile });
	const str = fly.log("1) this should be blacklisted").out();
	const str2 = fly.log("2) this should be not blacklisted").tag(tag1).out();
	assert(str).isTruthy();
	assert(str2).isTruthy();

	fly = new Fly("anotherID", {
		fileName: "otherFile",
		whitelist: blackListThisFile,
	});
	const str3 = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str3).isTruthy();
});

testFlyWhitelist.test("testWhitelistBOTHIdAndTags", () => {
	const blackListThisId = [{ id: id, tag: [tag1] }];
	createFly({ whitelist: blackListThisId });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	const str2 = fly.log("this should not be blacklisted").out();
	assert(str).isTruthy();
	assert(str2).isFalsy();

	fly = new Fly("anotherID", {
		whitelist: blackListThisId,
	});
	const str3 = fly.log("this should be not blacklisted").tag(tag1).out();
	assert(str3).isFalsy();
});

testFlyWhitelist.test("testWhitelistEITHERIdOrTags", () => {
	const blackListThisId = [{ id: id }, { tag: [tag1] }];
	createFly({ whitelist: blackListThisId });
	const str = fly.log("1) this should be blacklisted").out();
	const str2 = fly.log("2) this should not be blacklisted").tag(tag1).out();
	assert(str).isTruthy();
	assert(str2).isTruthy();

	fly = new Fly("anotherID", {
		whitelist: blackListThisId,
	});
	const str3 = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str3).isTruthy();
});

testFlyWhitelist.test("testWhitelistBOTHIdAndFilename", () => {
	const blackListThisId = [{ id: id, file: fileName }];
	createFly({ whitelist: blackListThisId });
	const str = fly.log("1) this should be blacklisted").out();
	assert(str).isTruthy();

	fly = new Fly("anotherID", {
		fileName: fileName,
		whitelist: blackListThisId,
	});
	const str3 = fly.log("3) this should be not blacklisted").out();
	assert(str3).isFalsy();
});

testFlyWhitelist.endTests();

function createFly(settings) {
	// force defaults for testing
	const defaults = {
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
	fly = new Fly(id, { ...defaults, fileName: fileName, ...settings });
}
