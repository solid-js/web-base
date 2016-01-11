/**
 * Micro template engine using regex
 */
module.exports = {
	delimiters: ['\%\%', '\%\%'],
	template: function (pTemplate, pValues)
	{
		var regex = new RegExp(module.exports.delimiters[0] + '(.*?)' + module.exports.delimiters[0], 'g');

		return pTemplate.replace(regex, function(i, pMatch) {
			return pValues[pMatch];
		});
	}
}
