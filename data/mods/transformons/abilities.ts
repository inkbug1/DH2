export const Abilities: {[abilityid: string]: ModdedAbilityData} = {
	sharpness: {//because I'm not a goddamn coward
		onModifyMove(move) {
			if (move.flags['slicing']) {
				this.debug('Sharpness boosting crit rate');
				move.critRatio = move.critRatio + 1;
			}
		},
		name: "Sharpness",
		rating: 3.5,
		num: 292,
	},
};