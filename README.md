# Fly Logging

Fly Logging is a lightweight, standalone logging tool designed for simplicity and flexibility. With features like runtime log filtering, color-coding, and conditional logging, it enhances development efficiency by enabling easy toggling of specific log messages, helping to avoid unnecessary code rewrites.

### Core Concept

The core concept of Fly Logging revolves around the idea that logging should be a flexible and integral part of the development and debugging process. Unlike traditional loggers that follow a one-dimensional level hierarchy, Fly Logging introduces a more dynamic approach, allowing developers to easily filter and manage logs. This makes Fly Logging not just a tool for logging errors but a versatile instrument to streamline development workflows.


## Out-of-the-box features include:

- **Tag-Based and Filename Filtering**: Easily filter logs by tags or originating files.
- **Flexible Settings**: Tailor Fly Logging to your needs with customizable settings.
- **Automatic Filename Detection**: Automatically detect and log the source filename.
- **Log Customization**: Modify log appearance and behavior for specific messages.
- **Level Customization**: Define and use custom log levels with unique filters.
- **Enhanced Readability**: Smart spacing for clearer and more readable log messages.
## Table of Contents

-  [Installation](#installation)
-  [Documentation](#documentation)
	- [How To Use Fly Logging](#how-to-log)
	- [Quick Start Guide](#quick-start)
	- [Advanced Use](#colors)
	- [Fly Logging Settings](#settings)
	- [Configuring Blacklists And Whitelists](#configuring-blacklists-and-whitelists)
-  [Examples](#examples)

# Installation

## Method 1 (NPM)

To install with npm, run the following command: 

`npm i fly-logging`

## Method 2 (Copy-Paste)

To manually add Fly Logging to your project, follow these instructions:

### For CommonJS

1) Download the dir `/src/commonjs`
2) Insert it into your project. 
3) Rename the dir `commonjs` to `fly-logging` for clarity
4) Import the module as follows
`const { Fly } = require(./fly-logging/index.cjs)`

### For ECMAScript

1) Download the dir `/src/module`
2) Insert it into your project. 
3) Rename the dir `module` to `fly-logging` for clarity
4) Add the requirement as follows
`import { Fly } from "./fly-logging/index.js";`

[(back to top)](#table-of-contents)
# Documentation

## Usage

### Quick Start

**Initialize Fly**  
Create a Fly instance with a unique identifier.
```js
const fly = Fly("uniqueID");
```
*(**NOTE**: Unless otherwise specified by the [settings](#settings), a Fly instance uses standard logging functions [(see Levels for more details)](#default-levels))*

**Log A Message**
Use the log method followed by .out() to output your message.
```js 
fly.log("Your log message").out();
```

### Colors

Logs messages can be given a color in line to help with identification: 

```js
const fly = new Fly("demo", { defaultMessageColor: "BLUE"})

fly.log("Normal message").out();				// This will print with default color BLUE
fly.log("IMPORTANT!!").color("RED").out();		// This will print as red
fly.log("Another normal message.").out();		// This will print with default color BLUE
```
*(**NOTE**: The color function only affects the color of the message, not additional log attributes. You can adjust those through the [settings](#settings) object).*

#### Conditional Coloring

Conditional coloring allows you to color log messages **only** if a condition is met: 

```js
const n = 3;
fly.log("when n is 3, I am green!")
	.color("RED")
	.if(n < 3)			// When this condition is met, the log message will be RED
	.color("GREEN")
	.if(n === 3)		// When this condition is met, the log message will be GREEN
	.color("YELLOW")
	.if(n > 3)			// When this condition is met, the log message will be YELLOW
	.out();
```

#### List Of Available Colors 

|color| ANSI|
|-----|-----|
|Black	|\u001b[30m|
|Red	|\u001b[31m|
|Green	|\u001b[32m|
|Yellow	|\u001b[33m|
|Blue	|\u001b[34m|
|Magenta	|\u001b[35m|
|Cyan	|\u001b[36m|
|White	|\u001b[37m|
|Reset	|\u001b[0m|
|Light_Black	|\u001b[90m|
|Light_Red	|\u001b[91m|
|Light_Green	|\u001b[92m|
|Light_Yellow	|\u001b[93m|
|Light_Blue	|\u001b[94m|
|Light_Magenta	|\u001b[95m|
|Light_Cyan	|\u001b[96m|
|Light_White	|\u001b[97m|

### Tagging

Tagging can be a useful feature for log identification and [blacklisting messages](#configuring-blacklists-and-whitelists). 

```js
fly.log("hello world!").tag("hello_world").out();
```

You can also have multiple tags on the same log

```js
fly.log("Foo Bar")
	.tag("foo")
	.tag("bar")
	.out();
```

#### Conditional Tagging

Conditional tagging allows you to tag log messages **only** if a condition is met: 


```js
const start = true;
fly.log("hello world!")
	.tag("is_start")
	.if(start)			// if start is set to true, then this will have the above tag. 
	.out();
```

### Conditional Logging

It is possible to run a log only when certain conditions are met, similar to the [conditional tagging](#conditional-tagging) and [conditional coloring](#conditional-coloring).

```js
fly.log("I will print")
	.if(1 === 1) 						
	.out();

fly.log("I will not print")
	.if(1 === 2)
	.out();
```
*(**NOTE**: In order to run the `.if()` command for the log as a whole, you **cannot** put it after a `.color()` or `.tag()`, as that will perform a conditional color or conditional tagging)*

[(back to top)](#table-of-contents)
## Settings

Settings can be passed as the second parameter while initializing a fly 

```js
const fly = new Fly("demo", {printTags: false, ... })
```

### Settings List

| Setting | Description | Default Value |
|----------|----------|----------|
|filename  |if provided, then will override the auto-detected filename   | null         |
|autoDetectFileName |when true, the fly will attempt to detect the name of the file it is located in | true
|noColors|when true, no colors will be generated in the log regardless of other settings|false
|defaultMessageColor|the default color that all messages will be|"BLUE"
|defaultFileNameColor|the default color for the file name|"CYAN"
|defaultIdColor|the default color for the log ID|"MAGENTA"
|defaultLevelColor|the default color for the log level|"YELLOW"
|defaultTagsColor|the default color for the log tags|"GREEN"
|levels|an object containing different log levels and their configurations|[See Section "Levels"](#levels)
|keepDefaultLevels|when true, keeps the default log levels provided|true
|thresholdLevel|the minimum log level required for a log to be displayed|0
|allowStringReturn|when true, allows logs to return a string (will continue to print as normal)|true
|printTags|when true, prints the tags associated with a log|true
| printLevel | when true, prints the log level| false|
| printFileName| when true, prints the file name   | true|
| printId | when true, prints the log ID| true|
| printLabels| when true, prints the labels (fileName, id, message, level, tags) in the specified order| true|
| printOrder | an array specifying the order in which the labels should be printed| ["fileName", "id", "message", "level", "tags"] |
| logDelimiter| the delimiter used to separate sections of the logs when printing| "; "|
| tagDelimiter| the delimiter used to separate tags when printing| ", "|
| blacklist| [See section On Blacklisting](#configuring-blacklists-and-whitelists) | undefined
| whitelist| [See section On Whitelisting](#configuring-blacklists-and-whitelists) | undefined

## Levels

The `levels` object contains different log levels and their configurations. 

### Default Levels

| Name     | Value | Default Color |
|----------|-------|---------------|
| trace    | 10    | -             |
| debug    | 100   | -             |
| log      | 200   | -             |
| info     | 300   | -             |
| warn     | 400   | YELLOW        |
| error    | 500   | RED           |
| critical | 1000  | RED           |


### Custom Log Levels
You can customize the log levels and their configurations according to your requirements.

#### Example
```js
const { LogLevel } = require("fly-logging")

const settings = {
	fileName: fileName,
	keepDefaultLevels: true, // keep defaults (trace, log, error, etc)
	levels: {
		foo: new LogLevel({ value: 12 }), // Create a new level called "foo" with value of 12 (useful for threshholding)
		bar: new LogLevel({ value: 2000, defaultColor: "RED", forceCaps: true}) // Create a new level called "bar"
	},
};

const fly = Fly("demo", settings);

fly.log("default log level").out();
fly.foo("custom log level").out();
fly.bar("custom log level with color and forced caps").out();

```


[(back to top)](#table-of-contents)
## Configuring Blacklists And Whitelists 

Control what gets logged with blacklist and whitelist features:

- **Blacklist**: Specify logs that should be ignored.
- **Whitelist**: Define logs that are always displayed, regardless of other settings.

### Creating A Blacklist / Whitelist

The following attributes can be black/whitelisted as needed: 
- id
- filename
- tag

*(**NOTE**: To filter by log level, set the fly's `thresholdLevel` level in its settings)*


#### How To Use

You can combine attributes for more complex filtering. To block when two or more parameters are **both** present, add them to the **same** object in your black/whitelist. To block when **any/either** of the parameters are met, add them to **different** objects. 

#### Blacklist Examples

```json
 [
	{"file": "file1.js", "tag": "foo"}, 
	{"id": "badFlyId", "tags": ["foo", "bar"]} 
]
```
```js
	const blacklist = require("blacklist.json");

	// RULE ONE {"file": "file1.js", "tag": "foo"}
	const fly = new Fly("fly", {fileName: "file1.js", blacklist});
	fly.log("hello world!").out(); // this will print, because it does not contain the prohibited tag
	fly.log("hello world!").tag("bar").out(); // this will print, because this tag is not prohibited for this file/id
	fly.log("hello world!").tag("foo").out(); // this will NOT print, because the tag and fileName match the prohibited values

	...

	// RULE TWO {"id": "badFlyId", "tags": ["foo", "bar"]}  
	
	const fly2 = new Fly("badFlyId", {fileName: "notBlacklisted.js", blacklist});
	fly2.log("hello world!").out(); //This will print, because it is not tagged with EITHER of the prohibited tags (foo and bar)
	fly2.log("hello world!").tag("foo").out(); // this will print, because it is tagged with ONLY ONE of the prohibited tags
	fly2.log("hello world!").tag("foo").tag("bar").out(); // this will NOT print, because has a forbidden id and BOTH prohibited tags for that ID
	
```
*(**NOTE**: the rule shown above for blacklists also apply to whitelists)*


#### Blacklisting via Factory Function
For a project-wide blacklist, consider using a FlyFactory that reads from a JSON file.

##### Example FlyFactory with Blacklist 
```js

const blacklist = require("blacklist.json");
const { Fly } = require("fly-logging");

function FlyFactory(id, settings) {
	return new Fly(id, {...settings, blacklist: blacklist})
}

```

[(back to top)](#table-of-contents)
## Examples

### Example (basic)

```js

const fly = Fly("demo"); // creates fly with default settings

fly.log("hello world").out();

```

### Example (advanced)

```js
const { Fly } = require("fly-logging");

const fly = Fly("counterTrackingFly", {
	printFileName: false,
	printId: false,
});
let number = 0;
fly.log("the number is currently", number, ".").out();

while (number < 5) {
	number++;

	fly.log("the number is now '", number, "'")
        .tag("count")
        .out();

	fly.log("the number (", number, ") is even") // print this log only when the number is even.
		.if(number % 2 === 0)
		.color("RED") // When this log runs, color the message red.
		.tag("parity")
		.out();
}

fly.log("the number has finished counting. It is now at", number, ".")
	.color("green")
	.if(number % 2 === 0) // If the number is even when it ends, color it green.
	.color("magenta")
	.if(number % 2 !== 0) // If the number is odd when it ends, color it magenta.
	.out();
```

[(back to top)](#table-of-contents)
