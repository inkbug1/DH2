export const Scripts: ModdedBattleScriptsData = {
	teambuilderConfig: {
		excludeStandardTiers: true,
		customTiers: ['TF'],
		customDoublesTiers: ['TF'],
	},
	//init() {},
	actions: {
		canMegaEvo(pokemon: Pokemon) {
			const species = pokemon.baseSpecies;
			//console.log(species);
			const altForme = species.otherFormes && this.dex.species.get(species.otherFormes[0]);
			//console.log(altForme);
			//console.log(species);
			const item = pokemon.getItem();
			// Mega Rayquaza
			if ((this.battle.gen <= 7 || this.battle.ruleTable.has('+pokemontag:past')) &&
				altForme?.isMega && altForme?.requiredMove &&
				pokemon.baseMoves.includes(toID(altForme.requiredMove)) && !item.zMove) {
				return altForme.name;
			}
			// a hacked-in Megazard X can mega evolve into Megazard Y, but not into Megazard X
			if (item.megaEvolves === species.baseSpecies && item.megaStone !== species.name) {
				return item.megaStone;
			}
			//Put stuff here===========
			if (altForme.forme.includes("Alt")) {
				return altForme.name;//okay i got this
			}
			return null;
		},

		runMegaEvo(pokemon: Pokemon) {
			const speciesid = pokemon.canMegaEvo || pokemon.canUltraBurst;
			if (!speciesid) return false;
			//console.log(pokemon);
			if (pokemon.species.altForme) {
				//pokemon.formeChange(pokemon.species.altForme, pokemon.getItem(), true);
				pokemon.m.willTransform = pokemon.species.altForme;
			} else {
				pokemon.formeChange(speciesid, pokemon.getItem(), true);
				this.battle.runEvent('AfterMega', pokemon);
				return true;
			}
			
			//pokemon.addVolatile('altstats');
/*======== Just don't bother with this ==========
			// Limit one mega evolution
			const wasMega = pokemon.canMegaEvo;
			for (const ally of pokemon.side.pokemon) {
				if (wasMega) {
					ally.canMegaEvo = null;
				} else {
					ally.canUltraBurst = null;
				}
			}
*/
		},
	},
	pokemon: {
		formeChange(//For Abilities
			speciesId: string | Species, source: Effect = this.battle.effect,
			isPermanent?: boolean, message?: string
		) {
			const rawSpecies = this.battle.dex.species.get(speciesId);

			const species = this.setSpecies(rawSpecies, source);
			if (!species) return false;

			if (this.battle.gen <= 2) return true;

			// The species the opponent sees
			const apparentSpecies =
				this.illusion ? this.illusion.species.name : species.baseSpecies;
			if (isPermanent) {
				this.baseSpecies = rawSpecies;
				this.details = species.name + (this.level === 100 ? '' : ', L' + this.level) +
					(this.gender === '' ? '' : ', ' + this.gender) + (this.set.shiny ? ', shiny' : '');
				let details = (this.illusion || this).details;
				if (this.terastallized) details += `, tera:${this.terastallized}`;
				this.battle.add('detailschange', this, details);
				if (source.effectType === 'Item') {
					this.canTerastallize = null; // National Dex behavior
					if (source.zMove) {
						this.battle.add('-burst', this, apparentSpecies, species.requiredItem);
						this.moveThisTurnResult = true; // Ultra Burst counts as an action for Truant
					} else if (source.onPrimal) {
						if (this.illusion) {
							this.ability = '';
							this.battle.add('-primal', this.illusion, species.requiredItem);
						} else {
							this.battle.add('-primal', this, species.requiredItem);
						}
					} else {
						// So a Mega Evolution message isn't sent while we're waiting on Ogerpon text
						if (source.megaEvolves) {
							this.battle.add('-mega', this, apparentSpecies, species.requiredItem);
						}
						this.moveThisTurnResult = true; // Mega Evolution counts as an action for Truant
					}
				} else if (source.effectType === 'Status') {
					// Shaymin-Sky -> Shaymin
					this.battle.add('-formechange', this, species.name, message);
				}
			} else {
				if (source.effectType === 'Ability') {
					this.battle.add('-formechange', this, species.name, message, `[from] ability: ${source.name}`);
				} else {
					this.battle.add('-formechange', this, this.illusion ? this.illusion.species.name : species.name, message);
				}
			}
			if (isPermanent && !['disguise', 'iceface'].includes(source.id)) {
				if (this.illusion) {
					this.ability = ''; // Don't allow Illusion to wear off
				}
				//EDITS HERE: so ability slots are remembered
				if (this.m.abilitySlot) {
					if (species.abilities[this.m.abilitySlot]) {
						this.setAbility(species.abilities[this.m.abilitySlot], null, true);
					} else this.setAbility(species.abilities['0'], null, true);
				} else {
					this.setAbility(species.abilities['0'], null, true);
					this.baseAbility = this.ability;
				}
			}
			if (this.terastallized) {
				this.knownType = true;
				this.apparentType = this.terastallized;
			}
			return true;
		}
	},
};