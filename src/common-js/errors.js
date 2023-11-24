class FlyError extends Error {
	constructor(message) {
		super(message);
		this.name = "FlyError";
	}
}

const NoIdGiven = () => new FlyError("id is required");

const IdAlreadyExists = (id) => new FlyError(`fly with '${id}' already exists`);

const NoLevelsDefined = (id) =>
	new FlyError(`No levels defined for fly with id '${id}'`);
const DuplicateLevelValuesFound = (id, duplicates) =>
	new FlyError(
		`Duplicate level values found in fly '${id}': ${duplicates.join(", ")}`
	);
const InvalidThresholdLevel = (id, level) =>
	new FlyError(
		`level in fly '${id}' not found while setting threshold (${level})`
	);

module.exports = {
	NoIdGiven,
	IdAlreadyExists,
	NoLevelsDefined,
	DuplicateLevelValuesFound,
	InvalidThresholdLevel,
};
