module.exports = function ()
{
	return {
		// Delete typescript poops
		typescript: [
			'{= path.temp}/',
			'.tscache',
			'tscommand*'
		]
	}
};