import { cardschema } from "./cardschema";

export class cardstore {
    cards: Object = {};
    lastId = -1;

    _addCard (card: cardschema) {
        card.id = String(++this.lastId);
        this.cards[card.id] = card;
        return card.id;
    }

    getCard (cardId: string) {
        return this.cards[cardId];
    }

    newCard (description: string): string {
        const card = new cardschema();
        card.description = description;
        return this._addCard(card);
    }
}