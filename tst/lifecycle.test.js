import { Tests, assert } from "@slasherrose/check-up";
import { Fly, exterminate } from "fly-logging";
import Errors from "../src/module/errors.js";

const testFlyLifecycle = new Tests("Life Cycle Test");
const id = "id";
const differentId = "id2";

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
testFlyLifecycle.onTestStart(() => {
	fly = new Fly(id, printAllSettings);
});

testFlyLifecycle.onTestFinish(() => {
	exterminate();
});

testFlyLifecycle.test("testNormalFunctionality", () => {
	fly.log("hello").out();
});

testFlyLifecycle.test("testIdAlreadyExists", () => {
	assert(() => {
		const fly2 = new Fly(id, printAllSettings);
	}).failsWithError(Errors.IdAlreadyExists(id));
});

testFlyLifecycle.test("testNoIdGiven", () => {
	assert(() => {
		const fly2 = new Fly();
	}).failsWithError(Errors.NoIdGiven());
});

testFlyLifecycle.test("testExterminate", () => {
	assert(() => {
		exterminate();
		const fly2 = new Fly(id, printAllSettings);
		fly2.log("hello").out();
	}).succeeds();
});
testFlyLifecycle.endTests();
