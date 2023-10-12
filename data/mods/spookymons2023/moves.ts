export const Moves: {[moveid: string]: ModdedMoveData} = {
	banefultransformation: {
		num: -1001,
		accuracy: 100,
		basePower: 80,
		category: "Status",
		shortDesc: "Poisons the target if the user is statused.",
		name: "Baneful Transformation",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Moonlight", target);
		},
		condition: {
			// add effect of Neurotoxin here after confirming it works
/*
			onEffectiveness(typeMod, target, type, move) {
				if (!target || !target.illusion || move.category === 'Status' || !this.activeMove || !this.activeMove.source) return;
				if (!target.runImmunity(move.type)) return;
				if ((this.activeMove.source.status === 'psn' || this.activeMove.source.status === 'tox') && typeMod > 0) {
					return 0;
				}
			},
	*/

			// mechanical distinctions of the monster (not sure if any or all of these will be kept)
			onTryHeal(damage, target, source, effect) { // reduce healing
				if (target.illusion) return this.chainModify([2, 3]);
			},
			onDamage(damage, target, source, effect) { // reduce damage taken
				if (target.illusion) return this.chainModify([2, 3]);
			},
			onModifySpe(spe, pokemon) { // reduce Speed
				if (pokemon.illusion) return this.chainModify(0.5);
			},

			// should appear as a monster
			onBeforeSwitchIn(pokemon) {
				pokemon.illusion = null;
				if (pokemon.m.wolfsbane) { // should be the Pokémon that used Baneful Transformation
					pokemon.illusion = pokemon.m.wolfsbane;
					pokemon.m.backup.gender = pokemon.m.wolfsbane.gender;
					pokemon.m.backup.name = pokemon.m.wolfsbane.name;
					pokemon.m.backup.species = pokemon.m.wolfsbane.species;
					pokemon.illusion.gender = '';
					pokemon.illusion.name = '???';
					pokemon.illusion.species = {
						id: 'banefultransformation',
						name: 'Baneful Transformation',
						forme: '',
						types: ["???"],
						abilities: {0: 'Neurotoxin'},
					};
				}
			},
			// tiny bit of backup to make sure the original Wolfsbrain's properties aren't messed with... should test to see if this matters!
			onSwitchOut(pokemon) {
				pokemon.illusion.gender = pokemon.m.backup.gender;
				pokemon.illusion.name = pokemon.m.backup.name;
				pokemon.illusion.species = pokemon.m.backup.species;
				pokemon.illusion = null;
			},
			onFaint(pokemon) {
				pokemon.illusion.gender = pokemon.m.backup.gender;
				pokemon.illusion.name = pokemon.m.backup.name;
				pokemon.illusion.species = pokemon.m.backup.species;
				pokemon.illusion = null;
				this.add('-end', pokemon, 'Illusion');
				this.add('-message', `The monster was ${pokemon.name}!`);
			},

			// moves hidden while appearing as a monster
			onModifyMove(move, source, target) {
				if (source.illusion) {
					move.name = 'an unknown move';
				}
			},
			onPrepareHit(target, source, move) {
				if (source.illusion && source === this.effectState.target) {
					this.attrLastMove('[still]');
					this.add('-anim', source, "Mist", source);
				}
			},
		},
		target: "normal",
		type: "Psychic",
		contestType: "Clever",
	},
};
