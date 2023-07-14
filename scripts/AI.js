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

/* 再抽牌前調整牌差 */
function adjust_deck_Lv0(playerID, max_diff) {
    let card_diff = 0;
    for (let i = 0; i < 4; i++)
        card_diff +=  player[CPU].collect[i].length - player[PLR].collect[i].length;
    if (card_diff <= max_diff)
        return;
    console.log('adjust：', card_diff);
    /* 現在CPU的拿到的牌比玩家多 */
    if (playerID == PLR) /* 輪到玩家抽牌 -> 要抽到可配對的牌 */
        next_is_pair();
    else /* 輪到電腦抽牌 -> 不能抽到可配對的牌 */
        next_not_pair();
}

//#endregion

//#region Lv1 隨機出牌、棄牌、koikoi

function cpu_play_Lv1() {
    player[CPU].selected_handID = -1;
    player[CPU].selected_fieldID = -1;
    loop:
    for (let i = 0; i < player[CPU].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (Math.floor(player[CPU].hand[i]/4) == Math.floor(field.card[j]/4)) {
                player[CPU].selected_handID = i;
                player[CPU].selected_fieldID = j;
                break loop;
            }
        }
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
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

function cpu_play_Lv2() {
    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[CPU].selected_handID = -1;
    player[CPU].selected_fieldID = -1;
    for (let i = 0; i < player[CPU].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++)
            if (Math.floor(player[CPU].hand[i]/4) == Math.floor(field.card[j]/4) &&
               ((player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) ||
                (card_type[player[CPU].hand[i]] + card_type[field.card[j]] > 
                 card_type[player[CPU].hand[player[CPU].selected_handID]] + card_type[field.card[player[CPU].selected_fieldID]]))) {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
            }

    // 如果沒找到可配對的 -> 棄價值最低的牌
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        for (let i = 1; i < player[CPU].hand.length; i++)
            if (card_type[player[CPU].hand[i]] < card_type[player[CPU].hand[player[CPU].selected_handID]])
                player[CPU].selected_handID = i;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_collect_card_Lv2(pairFieldID) {
    return (card_type[pairFieldID[0]] > card_type[pairFieldID[1]]) ? pairFieldID[0] : pairFieldID[1];
}

function cpu_decide_koi_Lv2() {
    let get = 0;
    if (data.koi_bonus) get = player[CPU].score * (player[CPU].koi_time + player[CPU].koi_time + 1);
    else if (data.seven_bonus && player[CPU].score >= 7) get = player[CPU].score * 2;
    else get = player[CPU].score;

    if (game.month == data.MAXMONTH)
        return (player[CPU].total_money + get < player[PLR].total_money);

    if (player[CPU].total_money + get < player[PLR].total_money)
        return (Math.floor(Math.random() * 2) == 0);
    return (Math.floor(Math.random() * 3) == 0);
}

function adjust_deck_Lv2(playerID, max_diff) {
    let card_diff = 0;
    for (let i = 0; i < 4; i++)
        card_diff += player[Number(!playerID)].collect[i].length - player[playerID].collect[i].length;
    if (Math.abs(card_diff) <= max_diff)
        return;
    console.log('adjust：', playerID==PLR ? 'PLR':'CPU', (playerID==PLR) ? card_diff : -card_diff);
    if (card_diff > 0) /* 對方牌比我多 -> 我要抽到可配對的牌 */
        next_is_pair();
    else /* 對方牌比我少 -> 我不能抽到可配對的牌 */
        next_not_pair();
}

//#endregion

//#region Lv3

function cpu_play_Lv3() {
    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[CPU].selected_handID = -1;
    player[CPU].selected_fieldID = -1;
    for (let i = 0; i < player[CPU].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++)
            if (Math.floor(player[CPU].hand[i]/4) == Math.floor(field.card[j]/4) &&
               ((player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) ||
                (card_val[player[CPU].hand[i]] + card_val[field.card[j]] > 
                 card_val[player[CPU].hand[player[CPU].selected_handID]] + card_val[field.card[player[CPU].selected_fieldID]]))) {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
            }

    // 如果沒找到可配對的 -> 棄價值最低的牌
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        for (let i = 1; i < player[CPU].hand.length; i++)
            if (card_val[player[CPU].hand[i]] < card_val[player[CPU].hand[player[CPU].selected_handID]])
                player[CPU].selected_handID = i;
        /* 找到場上空的位置 */
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
                break;
            }
    }
}

function cpu_decide_koi_Lv3() {
    let get = 0;
    if (data.koi_bonus) get = player[CPU].score * (player[CPU].koi_time + player[CPU].koi_time + 1);
    else if (data.seven_bonus && player[CPU].score >= 7) get = player[CPU].score * 2;
    else get = player[CPU].score;

    if (game.month == data.MAXMONTH)
        return (player[CPU].total_money + get < player[PLR].total_money);

    if (player[PLR].collect[0].length >= 8 ||
        player[PLR].collect[1].length >= 4 ||
        player[PLR].collect[2].length >= 4 ||
       (player[PLR].collect[3].length >= 2 && player[CPU].collect[3].length <= 1))
        return false;

    if (player[CPU].collect[0] >= 9 &&
        player[PLR].collect[0].length <= 7 &&
        player[PLR].collect[1].length <= 2 &&
        player[PLR].collect[2].length >= 2 &&
        player[PLR].collect[3].length <= 1)
        return true;

    return (Math.floor(Math.random() * 2) == 0);
}

//#endregion

function reset_card_val() {
    card_val  = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        card_val[i] = 1;

    if (data.month_yaku) {
        card_val[game.month * 4] += 1;
        card_val[game.month * 4 + 1] += 1;
        card_val[game.month * 4 + 2] += 1;
        card_val[game.month * 4 + 3] += 1;
    }
    card_val[8] += Number(data.flower_moon_sake) + Number(data.flower_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus);
    card_val[28] += Number(data.flower_moon_sake) + Number(data.moon_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus);
    card_val[32] += Number(data.flower_moon_sake) + Number(data.flower_sake) + Number(data.moon_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus) + Number(data.kiku_dross);
    if (data.rain_rule)
        card_val[40] -= 1;
    if (data.fog_rule)
        card_val[44] -= 1;

    card_val[ 0] += 2 + Number((data.light_accumulate));
    card_val[ 8] += 2 + Number((data.light_accumulate));
    card_val[28] += 2 + Number((data.light_accumulate));
    card_val[40] += 1 + Number((data.light_accumulate));
    card_val[44] += 2 + Number((data.light_accumulate));

    if (data.matsukiribozu) {
        card_val[0] += 1;
        card_val[28] += 1;
        card_val[44] += 1;
    }
    if (data.sugawara) {
        card_val[0] += 1;
        card_val[4] += 1;
        card_val[8] += 1;
    }
    if (data.inoshikacho) {
        card_val[20] += 1;
        card_val[24] += 1;
        card_val[36] += 1;
    }
    if (data.five_bird) {
        card_val[4] += 1;
        card_val[12] += 1;
        card_val[29] += 1;
    }
    if (data.grass) {
        card_val[13] += 1;
        card_val[17] += 1;
        card_val[25] += 1;
    }
    card_val[ 1] += Number(data.akatan_aotan) + Number(data.akatan) + Number(data.akatan_aotan_accumulate);
    card_val[ 5] += Number(data.akatan_aotan) + Number(data.akatan) + Number(data.akatan_aotan_accumulate);
    card_val[ 9] += Number(data.akatan_aotan) + Number(data.akatan) + Number(data.akatan_aotan_accumulate);
    card_val[21] += Number(data.akatan_aotan) + Number(data.aotan ) + Number(data.akatan_aotan_accumulate);
    card_val[33] += Number(data.akatan_aotan) + Number(data.aotan ) + Number(data.akatan_aotan_accumulate);
    card_val[37] += Number(data.akatan_aotan) + Number(data.aotan ) + Number(data.akatan_aotan_accumulate);
    card_val[ 1] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[ 5] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[ 9] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[13] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[17] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[21] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[25] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[33] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);
    card_val[37] += Number(data.seven_tan || data.six_tan) + Number(data.tan_accumulate);

    for (let i = 0; i < CARD_NUM; i++)
        card_val[i] *= 3;
}

function update_card_val(cardID) {
    for (let i = 0; i < CARD_NUM; i++)
        if (card_type[i] == card_type[cardID])
            card_val[i] += 1;
    if (data.month_yaku && Math.floor(cardID/4) == game.month) {
        card_val[game.month * 4] += 1;
        card_val[game.month * 4 + 1] += 1;
        card_val[game.month * 4 + 2] += 1;
        card_val[game.month * 4 + 3] += 1;
    }
    if (cardID == 8 || cardID == 28 || cardID == 32) {
        card_val[ 8] += Number(data.flower_moon_sake) + Number(data.flower_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus);
        card_val[28] += Number(data.flower_moon_sake) + Number(data.moon_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus);
        card_val[32] += Number(data.flower_moon_sake) + Number(data.flower_sake) + Number(data.moon_sake) + Number(data.flower_moon_sake_accumulate) - Number(data.flower_moon_sake_bonus);
    }
    if (data.matsukiribozu && (cardID == 0 || cardID == 28 || cardID == 44)) {
        card_val[0] += 1;
        card_val[28] += 1;
        card_val[44] += 1;
    }
    if (data.sugawara && (cardID == 0 || cardID == 4 || cardID == 8)) {
        card_val[0] += 1;
        card_val[4] += 1;
        card_val[8] += 1;
    }
    if (data.inoshikacho && (cardID == 20 || cardID == 24 || cardID == 36)) {
        card_val[20] += 1;
        card_val[24] += 1;
        card_val[36] += 1;
    }
    if (data.five_bird && (cardID == 4 || cardID == 12 || cardID == 29)) {
        card_val[4] += 1;
        card_val[12] += 1;
        card_val[29] += 1;
    }
    if (data.grass && (cardID == 13 || cardID == 17 || cardID == 25)) {
        card_val[13] += 1;
        card_val[17] += 1;
        card_val[25] += 1;
    }
    if (cardID == 1 || cardID == 5 || cardID == 9) {
        card_val[ 1] += Number(data.akatan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
        card_val[ 5] += Number(data.akatan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
        card_val[ 9] += Number(data.akatan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
    }
    if (cardID == 21 || cardID == 33 || cardID == 37) {
        card_val[21] += Number(data.aotan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
        card_val[33] += Number(data.aotan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
        card_val[37] += Number(data.aotan) + Number(data.akatan_aotan || data.akatan_aotan_accumulate);
    }
}