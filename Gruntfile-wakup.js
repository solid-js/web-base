module.exports = function (grunt, __)
{
	// ------------------------------------------------------------------------- WAKUP

	// @see also : https://github.com/dylang/grunt-notify

	grunt.loadNpmTasks('grunt-wakeup');
	grunt.config('wakeup', {
		success: {
			options: {
				sound: 'looking-up',
				//sound: 'gentle-roll',
				notifications: false,
				output: false
			}
		}
	});

	/**
	 bloom
	 concern
	 connected
	 full
	 gentle-roll
	 high-boom
	 hollow
	 hope
	 jump-down
	 jump-up
	 looking-down
	 looking-up (default)
	 nudge
	 picked
	 puff
	 realization
	 second-glance
	 stumble
	 suspended
	 turn
	 unsure
	 */
};
