export const Abilities: {[abilityid: string]: ModdedAbilityData} = {
	neurotoxin: {
		shortDesc: "Suppresses the type advantages of moves used by poisoned attackers.",
		onStart(source) {
			this.add('-ability', pokemon, 'Neurotoxin');
			this.add('-message', `${(source.illusion ? source.illusion.name : source.name)} won't take super-effective damage from poisoned attackers!`);
			this.field.addPseudoWeather('neurotoxin');
			// not meant to be obvious that this is a pseudoWeather; it's just for coding convenience
		},
		condition: {
			duration: 0, // lasts forever, isn't announced
			onAnyModifyMove(move, source, target) {
				if (source.status === 'psn' || source.status === 'tox') move.neurotoxin = true;
			},
			onAnyEffectiveness(typeMod, target, type, move) {
				if (target.hasAbility('neurotoxin') || target.volatiles['banefultransformation']) {
					if (move.neurotoxin && typeMod > 0) return 0; // I hope this works
				}
			},
		},
		name: "Neurotoxin",
		rating: 4,
		num: -2001,
	},
	divide: {
		shortDesc: "Doesn't do anything yet.",
		// doesn't do anything yet P:
		name: "Divide",
		rating: 4,
		num: -2002,
	},
};
