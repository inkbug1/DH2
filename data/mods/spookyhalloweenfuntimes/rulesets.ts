export const Formats: {[k: string]: FormatData} = {
	teampreview: {
		effectType: 'Rule',
		name: 'Team Preview',
		desc: "Allows each player to see the Pok&eacute;mon on their opponent's team before they choose their lead Pok&eacute;mon",
		onBegin() {
			this.add('clearpoke');
			for (const pokemon of this.getAllPokemon()) {
				const details = pokemon.details.replace(', shiny', '')
					.replace(/(Arceus|Gourgeist|Pumpkaboo|Jackourd|Silvally|Urshifu)(-[a-zA-Z?-]+)?/g, '$1-*');
				const bloonketDetails = pokemon.details.replace(pokemon.species.name, 'Bloonket').replace(', shiny', '');
				this.add('poke', pokemon.side.id, pokemon.item === 'bloonketcostume' ? bloonketDetails : details, '');
			}
		},
		onTeamPreview() {
			this.makeRequest('teampreview');
		},
	},
	datamod: {
		effectType: 'Rule',
		name: 'Data Mod',
		desc: 'When a new Pokémon switches in for the first time, information about its types, stats and Abilities is displayed to both players.',
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				const species = this.dex.getSpecies(pokemon.species.name);
				const baseSpecies = Dex.getSpecies(pokemon.species.name);
				let modded = false;
				for (const type in [0, 1]) {
					if (species.types[type] !== baseSpecies.types[type]) {
						// console.log(species.types[type] + " is different from " + baseSpecies.types[type]);
						modded = true;
					}
				}
				if (species.baseStats.hp !== baseSpecies.baseStats.hp) modded = true;
				if (species.baseStats.atk !== baseSpecies.baseStats.atk) modded = true;
				if (species.baseStats.def !== baseSpecies.baseStats.def) modded = true;
				if (species.baseStats.spa !== baseSpecies.baseStats.spa) modded = true;
				if (species.baseStats.spd !== baseSpecies.baseStats.spd) modded = true;
				if (species.baseStats.spe !== baseSpecies.baseStats.spe) modded = true;
				if (species.abilities[0] !== baseSpecies.abilities[0]) modded = true;
				if (species.abilities[1] !== baseSpecies.abilities[1]) modded = true;
				if (species.abilities['H'] !== baseSpecies.abilities['H']) modded = true;
				if (species.abilities['S'] !== baseSpecies.abilities['S']) modded = true;
				if (modded) {
					pokemon.isModded = true;
					// console.log(species.name + " is different from in canon");
				// } else {
					// console.log(species.name + " is the same as in canon");
				}
			}
		},
		onSwitchIn(pokemon) {
			let species = this.dex.getSpecies(pokemon.species.name);
			let switchedIn = pokemon.switchedIn;
			if (pokemon.illusion) {
				species = this.dex.getSpecies(pokemon.illusion.species.name);
				// console.log(pokemon.illusion.name + " is being reported");
				if (!pokemon.illusion.isModded) return;
				this.add('-start', pokemon, 'typechange', pokemon.illusion.getTypes(true).join('/'), '[silent]');
				if (pokemon.illusion.switchedIn) return;
				pokemon.illusion.switchedIn = true;
			} else {
				// console.log(pokemon.name + " is being reported");
				if (!pokemon.isModded) return;
				this.add('-start', pokemon, 'typechange', pokemon.getTypes(true).join('/'), '[silent]');
				if (pokemon.switchedIn) return;
				pokemon.switchedIn = true;
			}
			let abilities = this.dex.getAbility(species.abilities[0]).name;
			if (species.abilities[1]) {
				abilities += ` / ${this.dex.getAbility(species.abilities[1]).name}`;
			}
			if (species.abilities['H']) {
				abilities += ` / ${this.dex.getAbility(species.abilities['H']).name}`;
			}
			if (species.abilities['S']) {
				abilities += ` / ${this.dex.getAbility(species.abilities['S']).name}`;
			}
			const baseStats = species.baseStats;
			const type = species.types[0];
			if (species.types[1]) {
				const type2 = species.types[1];
				this.add(`raw|<ul class="utilichart"><li class="result"><span class="col pokemonnamecol" style="white-space: nowrap">` + species.name + `</span> <span class="col typecol"><img src="http://play.pokemonshowdown.com/sprites/types/${type}.png" alt="${type}" height="14" width="32"><img src="http://play.pokemonshowdown.com/sprites/types/${type2}.png" alt="${type2}" height="14" width="32"></span> <span style="float: left ; min-height: 26px"><span class="col abilitycol">` + abilities + `</span><span class="col abilitycol"></span></span></li><li style="clear: both"></li></ul>`);
			} else {
				this.add(`raw|<ul class="utilichart"><li class="result"><span class="col pokemonnamecol" style="white-space: nowrap">` + species.name + `</span> <span class="col typecol"><img src="http://play.pokemonshowdown.com/sprites/types/${type}.png" alt="${type}" height="14" width="32"></span> <span style="float: left ; min-height: 26px"><span class="col abilitycol">` + abilities + `</span><span class="col abilitycol"></span></span></li><li style="clear: both"></li></ul>`);
			}
			this.add(`raw|<ul class="utilichart"><li class="result"><span style="float: left ; min-height: 26px"><span class="col statcol"><em>HP</em><br>` + baseStats.hp + `</span> <span class="col statcol"><em>Atk</em><br>` + baseStats.atk + `</span> <span class="col statcol"><em>Def</em><br>` + baseStats.def + `</span> <span class="col statcol"><em>SpA</em><br>` + baseStats.spa + `</span> <span class="col statcol"><em>SpD</em><br>` + baseStats.spd + `</span> <span class="col statcol"><em>Spe</em><br>` + baseStats.spe + `</span> </span></li><li style="clear: both"></li></ul>`);
			if (species.creator) this.hint(`${species.name} was submitted by ${species.creator}!`);
		},
		onDamagingHit(damage, target, source, move) {
			if (target.hasAbility('illusion')) { // making sure the correct information is given when an Illusion breaks
				if (target.isModded) {
					this.add('-start', target, 'typechange', target.getTypes(true).join('/'), '[silent]');
					if (!target.switchedIn) {
						target.switchedIn = true;
						let species = this.dex.getSpecies(target.species.name);
						let abilities = this.dex.getAbility(species.abilities[0]).name;
						if (species.abilities[1]) {
							abilities += ` / ${this.dex.getAbility(species.abilities[1]).name}`;
						}
						if (species.abilities['H']) {
							abilities += ` / ${this.dex.getAbility(species.abilities['H']).name}`;
						}
						if (species.abilities['S']) {
							abilities += ` / ${this.dex.getAbility(species.abilities['S']).name}`;
						}
						const baseStats = species.baseStats;
						const type = species.types[0];
						if (species.types[1]) {
							const type2 = species.types[1];
							this.add(`raw|<ul class="utilichart"><li class="result"><span class="col pokemonnamecol" style="white-space: nowrap">` + species.name + `</span> <span class="col typecol"><img src="http://play.pokemonshowdown.com/sprites/types/${type}.png" alt="${type}" height="14" width="32"><img src="http://play.pokemonshowdown.com/sprites/types/${type2}.png" alt="${type2}" height="14" width="32"></span> <span style="float: left ; min-height: 26px"><span class="col abilitycol">` + abilities + `</span><span class="col abilitycol"></span></span></li><li style="clear: both"></li></ul>`);
						} else {
							this.add(`raw|<ul class="utilichart"><li class="result"><span class="col pokemonnamecol" style="white-space: nowrap">` + species.name + `</span> <span class="col typecol"><img src="http://play.pokemonshowdown.com/sprites/types/${type}.png" alt="${type}" height="14" width="32"></span> <span style="float: left ; min-height: 26px"><span class="col abilitycol">` + abilities + `</span><span class="col abilitycol"></span></span></li><li style="clear: both"></li></ul>`);
						}
						this.add(`raw|<ul class="utilichart"><li class="result"><span style="float: left ; min-height: 26px"><span class="col statcol"><em>HP</em><br>` + baseStats.hp + `</span> <span class="col statcol"><em>Atk</em><br>` + baseStats.atk + `</span> <span class="col statcol"><em>Def</em><br>` + baseStats.def + `</span> <span class="col statcol"><em>SpA</em><br>` + baseStats.spa + `</span> <span class="col statcol"><em>SpD</em><br>` + baseStats.spd + `</span> <span class="col statcol"><em>Spe</em><br>` + baseStats.spe + `</span> </span></li><li style="clear: both"></li></ul>`);
						if (species.creator) this.hint(`${species.name} was submitted by ${species.creator}!`);
					}
				} else {
					const types = target.baseSpecies.types;
					if (target.getTypes().join() === types.join()) {
						this.add('-end', target, 'typechange', '[silent]');
					}
				}
			}
		},
	},
	megadatamod: {
		effectType: 'Rule',
		name: 'Mega Data Mod',
		desc: 'Gives data on stats, Ability and types when a Pokémon Mega Evolves or undergoes Ultra Burst.',
		onSwitchIn(pokemon) {
			if (pokemon.illusion) {
				if (pokemon.illusion.species.forme.startsWith('Mega') || pokemon.illusion.species.forme.startsWith('Ultra')) {
					this.add('-start', pokemon, 'typechange', pokemon.illusion.getTypes(true).join('/'), '[silent]');
				}
			} else {
				if (pokemon.species.forme.startsWith('Mega') || pokemon.species.forme.startsWith('Ultra')) {
					this.add('-start', pokemon, 'typechange', pokemon.getTypes(true).join('/'), '[silent]');
				}
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.hasAbility('illusion')) {
				if (target.species.forme.startsWith('Mega') || target.species.forme.startsWith('Ultra')) {
					this.add('-start', target, 'typechange', target.getTypes(true).join('/'), '[silent]');
				} else {
					const types = target.baseSpecies.types;
					if (target.getTypes().join() === types.join()) {
						this.add('-end', target, 'typechange', '[silent]');
					}
				}
			}
		},
	},
};