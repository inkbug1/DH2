export const Items: {[itemid: string]: ModdedItemData} = {
	weirdpumpkin: {
		name: "Weird Pumpkin",
		spritenum: 578,
		onSwap(pokemon) { // activate on switch-in, and only if it hasn't been set already
			if (pokemon.itemState.rightfulHolder) return;
			pokemon.itemState.rightfulHolder = pokemon;
		},
		onTakeItem(item, source) {
			if (!this.activeMove) return;
			if (this.activeMove.id === 'knockoff' || this.activeMove.id === 'corrosivegas') return false; // it can be stolen, but not destroyed
		},
		onHit(target, source, move) {
			if (source && source !== target && !source.item && move) {
				let rightfulHolder = target.itemState.rightfulHolder;
				const pumpkin = target.takeItem();
				if (!pumpkin) return;
				source.setItem(pumpkin);
				source.itemState.rightfulHolder = rightfulHolder;
				console.log(source.itemState.rightfulHolder); // just to confirm whether the original holder was recorded correctly
				this.eachEvent('PumpkinBounce', this.effect); // check for Pokémon on the field that might be affected, just in case
				// no message for Weird Pumpkin changing hands
			}
		},
		num: -2000, // 2023 content
		gen: 9,
		desc: "A mysterious item that changes hands easily. Does it do anything?",
	},
};
