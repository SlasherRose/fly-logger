import { Tests, assert } from "@slasherrose/check-up";
import { Fly, LogLevel, exterminate } from "fly-logging";
let fly;

const testFlyBlacklist = new Tests("Blacklist Test");
const id = "id";
const tag1 = "tag1";
const tag2 = "tag2";
const msg = "hello";
const testLevel = "log";
const fileName = "BlacklistTest";

testFlyBlacklist.onTestFinish(() => {
	exterminate();
});

testFlyBlacklist.test("testEmptyBlacklist", () => {
	createFly({ blacklist: [] }); // does nothing

	let str;
	assert(() => {
		str = fly.log("hello").tag(tag1).out();
	}).succeeds();

	assert(str).isTruthy();
});

testFlyBlacklist.test("testBlacklistFileName", () => {
	const blackListJustFileName = [{ file: fileName }];
	createFly({ blacklist: blackListJustFileName });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
});

testFlyBlacklist.test("testBlacklistId", () => {
	const blackListJustId = [{ id: id }];
	createFly({ blacklist: blackListJustId });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
});

testFlyBlacklist.test("testBlacklistTagsOneString", () => {
	const blackListJustTag = [{ tags: tag1 }];
	createFly({ blacklist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
});

testFlyBlacklist.test("testBlacklistTagsOneArray", () => {
	const blackListJustTag = [{ tags: [tag1] }];
	createFly({ blacklist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
});

testFlyBlacklist.test("testBlacklistTagOneString", () => {
	const blackListJustTag = [{ tag: tag1 }];
	createFly({ blacklist: blackListJustTag });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
});

testFlyBlacklist.test("testBlacklistBOTHTags", () => {
	const blackListBothTags = [{ tags: [tag1, tag2] }];
	createFly({ blacklist: blackListBothTags });
	const str = fly
		.log("1) this should be blacklisted")
		.tag(tag1)
		.tag(tag2)
		.out();
	const str2 = fly.log("2) this should be not blacklisted").tag(tag1).out();
	const str3 = fly.log("3) this should be not blacklisted").tag(tag2).out();
	const str4 = fly.log("4) this should be not blacklisted").out();
	assert(str).isFalsy();
	assert(str2).isTruthy();
	assert(str3).isTruthy();
	assert(str4).isTruthy();
});

testFlyBlacklist.test("testBlacklistEITHERTags", () => {
	const blackListEitherTags = [{ tags: [tag1] }, { tags: [tag2] }];
	createFly({ blacklist: blackListEitherTags });
	const str = fly
		.log("1) this should be blacklisted")
		.tag(tag1)
		.tag(tag2)
		.out();
	const str2 = fly.log("2) this should be blacklisted").tag(tag1).out();
	const str3 = fly.log("3) this should be blacklisted").tag(tag2).out();
	const str4 = fly.log("4) this should be not blacklisted").out();
	assert(str).isFalsy();
	assert(str2).isFalsy();
	assert(str3).isFalsy();
	assert(str4).isTruthy();
});

testFlyBlacklist.test("testBlacklistBOTHFilenameAndTags", () => {
	const blackListThisFile = [{ file: fileName, tag: [tag1] }];
	createFly({ blacklist: blackListThisFile });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str).isFalsy();

	fly = new Fly("anotherID", {
		fileName: "otherFile",
		blacklist: blackListThisFile,
	});
	const str2 = fly.log("this should be not blacklisted").tag(tag1).out();
	assert(str2).isTruthy();
});

testFlyBlacklist.test("testBlacklistEITHERFilenameOrTags", () => {
	const blackListThisFile = [{ file: fileName }, { tag: [tag1] }];
	createFly({ blacklist: blackListThisFile });
	const str = fly.log("1) this should be blacklisted").out();
	const str2 = fly.log("2) this should be not blacklisted").tag(tag1).out();
	assert(str).isFalsy();
	assert(str2).isFalsy();

	fly = new Fly("anotherID", {
		fileName: "otherFile",
		blacklist: blackListThisFile,
	});
	const str3 = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str3).isFalsy();
});

testFlyBlacklist.test("testBlacklistBOTHIdAndTags", () => {
	const blackListThisId = [{ id: id, tag: [tag1] }];
	createFly({ blacklist: blackListThisId });
	const str = fly.log("this should be blacklisted").tag(tag1).out();
	const str2 = fly.log("this should not be blacklisted").out();
	assert(str).isFalsy();
	assert(str2).isTruthy();

	fly = new Fly("anotherID", {
		blacklist: blackListThisId,
	});
	const str3 = fly.log("this should be not blacklisted").tag(tag1).out();
	assert(str3).isTruthy();
});

testFlyBlacklist.test("testBlacklistEITHERIdOrTags", () => {
	const blackListThisId = [{ id: id }, { tag: [tag1] }];
	createFly({ blacklist: blackListThisId });
	const str = fly.log("1) this should be blacklisted").out();
	const str2 = fly.log("2) this should not be blacklisted").tag(tag1).out();
	assert(str).isFalsy();
	assert(str2).isFalsy();

	fly = new Fly("anotherID", {
		blacklist: blackListThisId,
	});
	const str3 = fly.log("this should be blacklisted").tag(tag1).out();
	assert(str3).isFalsy();
});

testFlyBlacklist.test("testBlacklistBOTHIdAndFilename", () => {
	const blackListThisId = [{ id: id, file: fileName }];
	createFly({ blacklist: blackListThisId });
	const str = fly.log("1) this should be blacklisted").out();
	assert(str).isFalsy();

	fly = new Fly("anotherID", {
		fileName: fileName,
		blacklist: blackListThisId,
	});
	const str3 = fly.log("3) this should be not blacklisted").out();
	assert(str3).isTruthy();
});

testFlyBlacklist.endTests();

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
