//#region Lv0 會幫玩家組成役

//#endregion

//#region Lv1 隨機出牌、棄牌、koikoi

//#endregion

//#region Lv2 出最高價值的牌、棄最低價值的牌

function cpu_play_Lv2() {
    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[CPU].selected_handID = -1;
    player[CPU].selected_fieldID = -1;
    for (let i = 0; i < player[CPU].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (field.card[j] < 0) continue;
            if (Math.floor(player[CPU].hand[i]/4) == Math.floor(field.card[j]/4)) {
                if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
                }
                else if (card_type[player[CPU].hand[i]] + card_type[field.card[j]] > 
                    card_type[player[CPU].hand[player[CPU].selected_handID]] + card_type[field.card[player[CPU].selected_fieldID]]) {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
                }
            }
        }

    // 如果沒找到可配對的 -> 棄價值最低的牌
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        for (let i = 1; i < player[CPU].hand.length; i++)
            if (card_type[player[CPU].hand[i]] < card_type[player[CPU].hand[player[CPU].selected_handID]])
                player[CPU].selected_handID = i;
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_collect_card_Lv2(pairFieldID) {
    return pairFieldID[Math.floor(Math.random() * 2)];
}

function cpu_decide_koi_Lv2() {
    if (game.month == data.MAXMONTH && player[CPU].total_money < player[PLR].total_money)
        return true;
	if (data.MAXMONTH == 1)
		return (Math.floor(Math.random() * 3) == 0);
    return (Math.floor(Math.random() * 2) == 0);
}

//#endregion