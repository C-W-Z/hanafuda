function next_is_pair() {
    loop:
    for (let i = 0; i < deck.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (field.card[j] == -1) continue;
            if (Math.floor(deck[i]/4) == Math.floor(field.card[j]/4)) {
                [deck[i], deck[deck.length-1]] = [deck[deck.length-1], deck[i]];
                break loop;
            }
        }
}

function next_not_pair() {
    loop:
    for (let i = 0; i < deck.length; i++) {
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (field.card[j] == -1) continue;
            if (Math.floor(deck[i]/4) == Math.floor(field.card[j]/4))
                continue loop;
        }
        [deck[i], deck[deck.length-1]] = [deck[deck.length-1], deck[i]];
        break;
    }
}

//#region Lv0 會幫玩家組成役

//#endregion

//#region Lv1 隨機出牌、棄牌、koikoi

function cpu_play_Lv1(cpuID) {
    player[cpuID].selected_handID = -1;
    player[cpuID].selected_fieldID = -1;
    loop:
    for (let i = 0; i < player[cpuID].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (Math.floor(player[cpuID].hand[i]/4) == Math.floor(field.card[j]/4)) {
                player[cpuID].selected_handID = i;
                player[cpuID].selected_fieldID = j;
                break loop;
            }
        }
    if (player[cpuID].selected_handID < 0 || player[cpuID].selected_fieldID < 0) {
        player[cpuID].selected_handID = 0;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[cpuID].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_collect_card_Lv1(pairFieldID) {
    return pairFieldID[Math.floor(Math.random() * 2)];
}

function cpu_decide_koi_Lv1() {
    return (Math.floor(Math.random() * 2) == 0);
}

//#endregion

//#region Lv2 出最高價值的牌、棄最低價值的牌

function cpu_play_Lv2(cpuID) {
    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[cpuID].selected_handID = -1;
    player[cpuID].selected_fieldID = -1;
    for (let i = 0; i < player[cpuID].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (Math.floor(player[cpuID].hand[i]/4) == Math.floor(field.card[j]/4) &&
               ((player[cpuID].selected_handID < 0 || player[cpuID].selected_fieldID < 0) ||
                (card_type[player[cpuID].hand[i]] + card_type[field.card[j]] > 
                 card_type[player[cpuID].hand[player[cpuID].selected_handID]] + card_type[field.card[player[cpuID].selected_fieldID]]))) {
                    player[cpuID].selected_handID = i;
                    player[cpuID].selected_fieldID = j;
            }
        }

    // 如果沒找到可配對的 -> 棄價值最低的牌
    if (player[cpuID].selected_handID < 0 || player[cpuID].selected_fieldID < 0) {
        player[cpuID].selected_handID = 0;
        for (let i = 1; i < player[cpuID].hand.length; i++)
            if (card_type[player[cpuID].hand[i]] < card_type[player[cpuID].hand[player[cpuID].selected_handID]])
                player[cpuID].selected_handID = i;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[cpuID].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_collect_card_Lv2(pairFieldID) {
    return (card_type[pairFieldID[0]] > card_type[pairFieldID[1]]) ? pairFieldID[0] : pairFieldID[1];
}

function cpu_decide_koi_Lv2(cpuID) {
    let get = 0;
    if (data.koi_bonus)
        get = player[cpuID].score * (player[cpuID].koi_time + player[cpuID].koi_time + 1);
    else if (data.seven_bonus && player[cpuID].score >= 7)
        get = player[cpuID].score * 2;
    else
        get = player[cpuID].score;

    if (game.month == data.MAXMONTH)
        return (player[cpuID].total_money + get < player[Number(!cpuID)].total_money);

    if (player[cpuID].total_money + get < player[Number(!cpuID)].total_money)
        return (Math.floor(Math.random() * 2) == 0);
    return (Math.floor(Math.random() * 3) == 0);
}

function adjust_deck_Lv2(playerID, max_diff) {
    let card_diff = 0;
    for (let i = 0; i < 4; i++)
        card_diff += player[Number(!playerID)].collect[i].length - player[playerID].collect[i].length;
    if (Math.abs(card_diff) <= max_diff)
        return;
    if (card_diff > 0) /* 對方牌比我多 -> 我要抽到可配對的牌 */
        next_is_pair();
    else /* 對方牌比我少 -> 我不能抽到可配對的牌 */
        next_not_pair();
}

//#endregion

//#region Lv3

function cpu_play_Lv3(cpuID) {
    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[cpuID].selected_handID = -1;
    player[cpuID].selected_fieldID = -1;

    for (let i = 0; i < player[cpuID].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (Math.floor(player[cpuID].hand[i]/4) == Math.floor(field.card[j]/4) &&
               ((player[cpuID].selected_handID < 0 || player[cpuID].selected_fieldID < 0) ||
                (card_val[player[cpuID].hand[i]] + card_val[field.card[j]] > 
                    card_val[player[cpuID].hand[player[cpuID].selected_handID]] + card_val[field.card[player[cpuID].selected_fieldID]]))) {
                    player[cpuID].selected_handID = i;
                    player[cpuID].selected_fieldID = j;
            }
        }

    // 如果沒找到可配對的 -> 棄價值最低的牌
    if (player[cpuID].selected_handID < 0 || player[cpuID].selected_fieldID < 0) {
        player[cpuID].selected_handID = 0;
        for (let i = 1; i < player[cpuID].hand.length; i++)
            if (card_val[player[cpuID].hand[i]] < card_val[player[cpuID].hand[player[cpuID].selected_handID]])
                player[cpuID].selected_handID = i;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[cpuID].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_koi_Lv3(cpuID) {
    if (game.month == data.MAXMONTH && player[cpuID].total_money < player[Number(!cpuID)].total_money)
        return true;
	if (data.MAXMONTH == 1)
		return (Math.floor(Math.random() * 3) == 0);
    if (player[cpuID].total_money - player[Number(!cpuID)].total_money > 10 ||
        player[Number(!cpuID)].collect[0] >= 8 ||
        player[Number(!cpuID)].collect[1] >= 5 ||
        player[Number(!cpuID)].collect[2] >= 5)
        return false;
    if (player[cpuID].collect[0] >= 9 &&
        player[Number(!cpuID)].collect[0] <= 5 &&
        player[Number(!cpuID)].collect[1] <= 2 &&
        player[Number(!cpuID)].collect[2] >= 2 &&
        player[Number(!cpuID)].collect[3] <= 1)
        return true;
    return (Math.floor(Math.random() * 2) == 0);
}