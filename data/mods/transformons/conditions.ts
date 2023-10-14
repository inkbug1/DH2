import {Dex, toID} from '../../../sim/dex';

export const Conditions: {[k: string]: ConditionData} = {
	altstats: {
		name: 'altstats',
		onStart(pokemon) {
			const species = this.dex.species.get(pokemon.baseSpecies.baseSpecies);
			//console.log(species);
			//console.log(species.otherFormes);
			const altForme = this.dex.species.get(species.otherFormes[0]);
			//console.log(altForme);
			//can i return here does this work
			const swapStats = altForme.swapStats !== null ? altForme.swapStats : null;
			//console.log(swapStats);
			if (swapStats == null) return;
			
			//this.add('-start', pokemon, 'altstats'); //I don't want this to have activation messages but I want this for clarity for now
			//console.log(pokemon.storedStats);
			//console.log(pokemon.storedStats['spe']);
			const newatk = swapStats.atk ? pokemon.storedStats[swapStats.atk] : pokemon.storedStats.atk;
			const newdef = swapStats.def ? pokemon.storedStats[swapStats.def] : pokemon.storedStats.def;
			const newspa = swapStats.spa ? pokemon.storedStats[swapStats.spa] : pokemon.storedStats.spa;
			const newspd = swapStats.spd ? pokemon.storedStats[swapStats.spd] : pokemon.storedStats.spd;
			const newspe = swapStats.spe ? pokemon.storedStats[swapStats.spe] : pokemon.storedStats.spe;
			
			pokemon.storedStats.atk = newatk;
			pokemon.storedStats.def = newdef;
			pokemon.storedStats.spa = newspa;
			pokemon.storedStats.spd = newspd;
			pokemon.storedStats.spe = newspe;
		},
		/* I think this has to do with Baton Pass?
		onCopy(pokemon) {
			const newatk = pokemon.storedStats.def;
			const newdef = pokemon.storedStats.atk;
			pokemon.storedStats.atk = newatk;
			pokemon.storedStats.def = newdef;
		},
		*/
		onEnd(pokemon) {
			//this.add('-end', pokemon, 'altstats'); //I don't want this to have activation messages but I want this for clarity for now
			
			//Put em back where they were! I hope.
			let statName: StatIDExceptHP;
			for (statName in pokemon.storedStats) {
				pokemon.storedStats[statName] = pokemon.baseStoredStats[statName];
			}
		},
		// as far as I can tell, onRestart is a method for conditions that defines their behavior if the condition is applied again?
		// i *think* it should do what we want here so ill leave it
		onRestart(pokemon) {
			pokemon.removeVolatile('altstats');
		},
	},
};