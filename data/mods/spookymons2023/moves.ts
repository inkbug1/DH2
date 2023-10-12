export const Moves: {[moveid: string]: ModdedMoveData} = {
	banefultransformation: { // WIP
		num: -2001, // 2023 content
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "The user summons an ally that it has turned into a monster.",
		name: "Baneful Transformation",
		pp: 20,
		priority: 0,
		flags: {}, // can't be Snatched or anything
		// TO DO:
		// first use: use move.selfSwitch to pick a target, record that target
		// subsequent uses: force to switch to the same target every time; the move fails if it can't
		// apply Baneful Transformation to the target before switching to it
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Black Hole Eclipse", source); // yeah I don't even know--
			this.add('-anim', source, "Moonlight", source);
		},
		condition: {
			// I think Neurotoxin will be handled internally as a field effect,
			// as I can't find any way to check the source of an active move from the target's point of view

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
			onSwap(pokemon) {
				// add some fun flavor text here? maybe? maybe.
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
