import { Tests, assert } from "@slasherrose/check-up";
import { Fly, exterminate } from "fly-logging";

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

const testFlyBasicsWithDefaults = new Tests("Logging Test");
const testColor = Colors.RED;
const testTag1 = "tag1";
const testTag2 = "tag2";

// Leave everything else default, but set these to true so we can verify they are printed
const printAllSettings = {
	printTags: true,
	printLevel: true,
	printFileName: true,
	printId: true,
	printLabels: true,
	printOrder: ["level", "fileName", "id", "message", "tags"],
};

let fly;
testFlyBasicsWithDefaults.onTestStart(() => {
	fly = new Fly("id", printAllSettings);
});

testFlyBasicsWithDefaults.onTestFinish(() => {
	exterminate();
});

testFlyBasicsWithDefaults.test("testWithDefaultLogLevel", () => {
	const msg = fly.log("this should print").out();
	assert(msg).contains("this should print");
});

testFlyBasicsWithDefaults.test("testIfStatementTrue", () => {
	const msg = fly.log("this should print").if(true).out();
	assert(msg).contains("this should print");
});

testFlyBasicsWithDefaults.test("testIfStatementFalse", () => {
	const msg = fly.log("this shouldn't print").if(false).out();
	assert(msg).isUndefined();
});

testFlyBasicsWithDefaults.test("testIfStatementColor", () => {
	verifyColorIsNotPresentInDefault();

	const msgRed = fly.log("this should be red").color("red").out();
	assert(msgRed).contains(testColor);
});

testFlyBasicsWithDefaults.test("testColorIfStatementTrue", () => {
	verifyColorIsNotPresentInDefault();

	const msg = fly.log("this should be red").color("red").if(true).out();
	assert(msg).contains(testColor);
});

testFlyBasicsWithDefaults.test("testColorIfStatementFalse", () => {
	verifyColorIsNotPresentInDefault();

	const msg = fly.log("this shouldn't be red").color("red").if(false).out();
	assert(msg).notContains(testColor);
});

testFlyBasicsWithDefaults.test("testTags", () => {
	const msg = fly.log("this should be tagged").tag(testTag1).out();
	assert(msg).contains(testTag1);
});

testFlyBasicsWithDefaults.test("testMultipleTags", () => {
	const msg = fly
		.log("this should be tagged")
		.tag(testTag1)
		.tag(testTag2)
		.out();
	assert(msg).contains(testTag1);
	assert(msg).contains(testTag2);
});

testFlyBasicsWithDefaults.test("testTagIfStatementTrue", () => {
	const msg = fly.log("this should be tagged").tag(testTag1).if(true).out();
	assert(msg).contains(testTag1);
});

testFlyBasicsWithDefaults.test("testTagIfStatementFalse", () => {
	const msg = fly
		.log("this shouldn't be tagged")
		.tag(testTag1)
		.if(false)
		.out();
	assert(msg).notContains(testTag1);
});

testFlyBasicsWithDefaults.test("testTagIfChainTrue", () => {
	const msg = fly
		.log("this should be tagged")
		.tag(testTag1)
		.if(true)
		.tag(testTag2)
		.out();
	assert(msg).contains(testTag1);
	assert(msg).contains(testTag2);
});

testFlyBasicsWithDefaults.test("testTagIfChainFalse", () => {
	const msg = fly
		.log("this shouldn't be tagged")
		.tag(testTag1)
		.if(false)
		.tag(testTag2)
		.out();
	assert(msg).notContains(testTag1);
	assert(msg).contains(testTag2);
});

testFlyBasicsWithDefaults.test("testNoOut", () => {
	const msg = fly.log("this shouldn't print");
	assert(msg).isNotType("string");
});

testFlyBasicsWithDefaults.endTests();

// if, for some reason, the default log level color is changed to include the test color,
// this will ensure the tests fail
function verifyColorIsNotPresentInDefault() {
	const msg = fly.log("this shouldn't be red").out();
	try {
		assert(msg).notContains(testColor);
	} catch (e) {
		throw new Error(
			"Default log level color has been changed and now contains a test color. Please update test to reflect change."
		);
	}
}
