export const Rulesets: {[k: string]: FormatData} = {
	transformonsmod: {
		//It'd be fun to try and implement some kind of combiner stuff
		//Like, combining HP somehow and stuff... could it be made to work w/ the team view widget?
		name: 'Transformons Mod',
		effectType: 'Rule',
		desc: 'Pokémon can change forms every turn, but it only happens when it takes its action.',
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				if (pokemon.set.ability == pokemon.species.abilities['0']) {
					pokemon.m.abilitySlot = '0';
				} else if (pokemon.set.ability == pokemon.species.abilities['H']) {
					pokemon.m.abilitySlot = 'H';
				} else if (pokemon.set.ability == pokemon.species.abilities['1']) {
					pokemon.m.abilitySlot = '1';
				} else {
					pokemon.m.abilitySlot = 'S';
				}
			}
		},
		onBeforeMove(pokemon) {
			if (pokemon.m.willTransform) {
				pokemon.formeChange(pokemon.species.altForme, pokemon.getItem(), true);
				//Data mod bit + Message for transform goes here
				this.add('-message', `${pokemon.name} transformed!`);
				this.runEvent('AfterMega', pokemon);//?
				pokemon.m.willTransform = null;
				pokemon.addVolatile('altstats');
			}
		},
		onSwitchIn(pokemon) {
			this.add('-start', pokemon, 'typechange', (pokemon.illusion || pokemon).getTypes(true).join('/'), '[silent]');
			if (pokemon.baseSpecies.swapStats) {
				pokemon.addVolatile('altstats');
			}
		},
		onAfterMega(pokemon) {
			this.add('-start', pokemon, 'typechange', (pokemon.illusion || pokemon).getTypes(true).join('/'), '[silent]');
		},
	},
};