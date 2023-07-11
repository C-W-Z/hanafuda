/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/hanafuda.git
 * @copyright © 2023 C-W-Z
 */

//#region Guess Smaller Card from Two Cards

function start_guess() {
    guessing = true;

    let month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    shuffle(month);
    guess_card[0] = new Card(month[0] * 4);
    guess_card[1] = new Card(month[11] * 4);
    guess_card[0].px = SCREEN_W/2 - CARD_LARGE_W * 2;
    guess_card[0].py = SCREEN_H/2-CARD_LARGE_H/2;
    guess_card[1].px = SCREEN_W/2 + CARD_LARGE_W;
    guess_card[1].py = SCREEN_H/2-CARD_LARGE_H/2;
    guess_text = '札を一枚選んでください';

    canvas.onmousedown = guess_click_func;
}

function draw_guess_card() {
    guess_card[0].draw_large();
    guess_card[1].draw_large();

    context.fillStyle = 'black';
    context.font = 36 * R + "px 'Yuji Syuku', sans-serif";
    context.fillText(guess_text, (SCREEN_W/2) * R, (SCREEN_H/2 - CARD_LARGE_H/2 - 36) * R);
}

function pointedGuessIndex() {
    if (mouse.x >= guess_card[0].px && mouse.x <= guess_card[0].px + CARD_LARGE_W &&
        mouse.y >= guess_card[0].py && mouse.y <= guess_card[0].py + CARD_LARGE_H)
        return 0;
    if (mouse.x >= guess_card[1].px && mouse.x <= guess_card[1].px + CARD_LARGE_W &&
        mouse.y >= guess_card[1].py && mouse.y <= guess_card[1].py + CARD_LARGE_H)
        return 1;
    return -1;
}

function guess_click_func(e) {
    /* not left click */
    if (e.button != 0)
        return;
    updateMouseXY(e);
    let i = pointedGuessIndex();
    if (i >= 0)
    {
        guess_result = (guess_card[i].ID < guess_card[Number(!i)].ID);
        startTime = performance.now();
        time_func = flip_guess_card(i);
        next_func = function (time) {
            guess_text = (guess_result ? 'あなた' : '相手') + 'が親になりました';
            
            next_func = function (time) {
                endAnimation();
                guessing = false;
                after_guess();
            }

            /* draw month under the two guess cards */
            context.fillStyle = 'black';
            context.font = 36 * R + "px 'Yuji Syuku', sans-serif";
            context.fillText(NUMBER[Math.floor(guess_card[0].ID / 4)+1]+'月', (guess_card[0].px + CARD_LARGE_W/2) * R, (guess_card[0].py + CARD_LARGE_H + 36) * R);
            context.fillText(NUMBER[Math.floor(guess_card[1].ID / 4)+1]+'月', (guess_card[1].px + CARD_LARGE_W/2) * R, (guess_card[1].py + CARD_LARGE_H + 36) * R);

            const smaller = (guess_card[0].ID < guess_card[1].ID) ? 0 : 1;
            if (time - startTime >= GUESS_WAIT) {
                guess_card[smaller].noticed = true;
                startTime = null;
                time_func = next_func;
            } else {
                let flag = false;
                for (let t = 0; t < twinkleTime; t++)
                    if (time - startTime >= GUESS_WAIT * t / twinkleTime &&
                        time - startTime <  GUESS_WAIT * (2*t+1) / (2 * twinkleTime))
                        flag = true;
                guess_card[smaller].noticed = flag;
            }
        }

        canvas.onmousedown = click_func;
    }
}

function flip_guess_card(i) {
    return function(time) {
        const deltaTime = (time - startTime) / FLIP_TIME;
        if (deltaTime >= 1) {
            guess_card[i].scaleX = 1;
            guess_card[Number(!i)].scaleX = 1;
            startTime = null;
            time_func = next_func;
        } else if (deltaTime >= 0.5) {
            guess_card[i].scaleX = 1;
            guess_card[Number(!i)].scaleX = Math.abs(easeOutQuad(time-startTime-FLIP_TIME*0.5, 1, -4*(deltaTime-0.5), FLIP_TIME*0.5));
            if (deltaTime >= 0.75)
                guess_card[Number(!i)].back = false;
        } else {
            guess_card[i].scaleX = Math.abs(easeOutQuad(time-startTime, 1, -4*deltaTime, FLIP_TIME*0.5));
            if (deltaTime >= 0.25)
                guess_card[i].back = false;
        }
    }
}

//#endregion

function start_month() {
    /* init month */
    // init deck
    deck = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        deck[i] = i;

    // reset cards
    for (let i = 0; i < CARD_NUM; i++)
        card[i].reset_month();

    // reset field
    field.reset_month();;

    // reset players
    player[PLR].reset_month();
    player[CPU].reset_month();

    // reset game info
    game.reset_month();
    game.month++;
    if (data.first_change)
        game.first = Number(!game.first);
    else if (game.winner != -1)
        game.first = game.winner;

    // reset animation
    endAnimation();

    // update data
    data.battleMonth++;

    // shuffle
    shuffle(deck);
    // 發牌
    deal_cards(game.first);
}

function pointedFieldIndex() {
    if (card == null) return -1;
    for (let i = 0; i < FIELD_SPACE; i++)
        if (mouse.x >= Field.X(i) && mouse.x <= Field.X(i) + CARD_W &&
            mouse.y >= Field.Y(i) && mouse.y <= Field.Y(i) + CARD_H)
            return i;
    return -1;
}

function pointedPlayerHandIndex() {
    if (card == null) return -1;
    for (let i = 0; i < player[PLR].hand.length; i++)
        if (mouse.x >= card[player[PLR].hand[i]].px && mouse.x <= card[player[PLR].hand[i]].px + CARD_W &&
            mouse.y >= card[player[PLR].hand[i]].py && mouse.y <= card[player[PLR].hand[i]].py + CARD_H)
            return i;
    return -1;
}

// 一幀的發牌動畫
function deal_step(cards, i) {
    if (i < HAND_NUM)
        return function(time) {
            const px = SCREEN_W / 2 + (CARD_W+CARD_GAP*2) * (i - HAND_NUM / 2) + CARD_GAP;
            const cx = SCREEN_W / 2 + (CARD_W+CARD_GAP*2) * (HAND_NUM / 2 - i - 1) + CARD_GAP;
            const dy = CARD_GAP;
            // to cpu hand
            step_move(cards[CPU + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, cx, dy, false)(time);
            // to player hand
            step_move(cards[PLR + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, px, SCREEN_H - (CARD_H+CARD_GAP*2) + dy, true)(time);
            // 發下2張牌
            next_func = deal_step(cards, i + 1);
        }

    return function(time) {
        for (let i = 0; i < HAND_NUM; i++) {
            const fx = Field.X(i + (FIELD_SPACE - HAND_NUM) / 2);
            const fy = Field.Y(i);
            // to field
            step_move(cards[0][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, fx, fy, true)(time);
        }
        next_func = after_deal(cards);
    }
}

/* 發牌 */
function deal_cards() {
    game.state = gameState.deal;

    // distribute cards
    let new_card = [[], [], []]; // 0:field, 1:player, 2:cpu
    for (let j = 0; j < 3; j++)
        for (let i = 0; i < HAND_NUM; i++) {
            new_card[j].push(deck.pop());
            movingCard.push(new_card[j][i]);
            card[new_card[j][i]].place = cardPlace.moving;
        }

    // animation
    startTime = performance.now(); // reset startTime
    time_func = deal_step(new_card, 0);
}

function after_deal(new_card) {
    return function (time) {
        endAnimation();

        // put to players' hand & field
        for (let i = 0; i < HAND_NUM; i++)
            field.insertCard(i+(FIELD_SPACE-HAND_NUM)/2, new_card[0][i]);
        for (let i = 0; i < HAND_NUM; i++)
            player[PLR].addHand(new_card[PLR + 1][i]);
        for (let i = 0; i < HAND_NUM; i++)
            player[CPU].addHand(new_card[CPU + 1][i]);

        // 第一回合開始
        game.round = 0;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

/* 玩家的回合 */
function player_play() {
    game.state = gameState.player_select_hand;
}

/* 玩家出牌 */
function player_play_card(playerID, handID, fieldID) {
    if (playerID == PLR)
        game.state = gameState.player_play_card;

    let handCardID = player[playerID].hand[handID];
    // 從手牌和場上移除handID和fieldID的2張牌
    player[playerID].removeHand(handID);

    // animation
    startTime = performance.now(); // reset startTime
    movingCard.push(handCardID);
    // 分為(手牌與場牌)有可以配對的與無可配對的2種情況
    if (field.card[fieldID] == -1) {
        // 棄牌
        time_func = step_move(handCardID, card[handCardID].px, card[handCardID].py, Field.X(fieldID), Field.Y(fieldID));
        next_func = after_play(playerID, handCardID, -1, fieldID);
    } else {
        time_func = step_move(handCardID, card[handCardID].px, card[handCardID].py, Field.X(fieldID), Field.Y(fieldID) + 10);
        next_func = player_collect_animation(playerID, handCardID, fieldID);
    }
}

function player_collect_animation(playerID, handCardID, fieldID) {
    return function (time) {
        //endAnimation();
        //console.log("f", field.card[fieldID]);
        let fieldCardID = field.card[fieldID];
        field.removeCard(fieldID);
        // next animation
        // startTime = performance.now(); // reset startTime
        // this is temp -> next is move to cards to collect
        time_func = after_play(playerID, handCardID, fieldCardID);
    }
}

function after_play(playerID, handCardID, fieldCardID, fieldID = -1) {
    return function (time) {
        // 保證月份相同
        // 手牌已經移除打出的牌，場上也移除對應的牌，都移到movingCard了

        endAnimation();

        if (fieldCardID >= 0) {
            // put to player's collect
            player[playerID].addCollect(handCardID);
            player[playerID].addCollect(fieldCardID);
        } else {
            // put to field
            field.insertCard(fieldID, handCardID);
        }

        // draw card from deck
        draw_new_card(playerID);
    }
}

function draw_new_card(playerID) {
    // draw card
    let new_card = deck.pop();
    player[playerID].draw_cardID = new_card;

    // show the new card
    card[new_card].back = false;
    card[new_card].place = cardPlace.moving;
    movingCard.push(new_card);

    // find the pair card
    let fieldID;
    let pairFieldID = [];
    // find if there are pair cards
    for (let i = 0; i < FIELD_SPACE; i++)
        if (Math.floor(field.card[i] / 4) == Math.floor(new_card / 4))
            pairFieldID.push(i);

    if (pairFieldID.length == 0)
    {
        // find space on field
        for (let i = 0; i < FIELD_SPACE; i++)
            if (field.card[i] == -1) {
                fieldID = i;
                break;
            }
        draw_card_animation(playerID, new_card, fieldID, -1);
    }
    else if (pairFieldID.length >= 2)
    {
        if (playerID == PLR) {
            // wait for player choose
            game.state = gameState.player_choose_card;
            field.update_noticed(Math.floor(new_card/4));
        } else /* CPU */ {
            // 未完成
            fieldID = pairFieldID[0];
            draw_card_animation(playerID, new_card, fieldID, field.card[fieldID]);
        }
    }
    else // only one card can pair
    {
        fieldID = pairFieldID[0];
        draw_card_animation(playerID, new_card, fieldID, field.card[fieldID]);
    }
}

function draw_card_animation(playerID, new_card, fieldID, fieldCardID) {
    if (playerID == PLR)
        game.state = gameState.player_end_round;

    if (fieldCardID >= 0) {
        // remove the card from field
        field.removeCard(fieldID);
    }
    // animation
    startTime = performance.now(); // reset startTime
    time_func = step_move(new_card, DECK_P.x, DECK_P.y, Field.X(fieldID), Field.Y(fieldID));
    // 這裡還要加上collect的動畫
    next_func = after_draw_new_card(playerID, new_card, fieldID, fieldCardID);
}

function after_draw_new_card(playerID, new_cardID, fieldID, fieldCardID) {
    return function (time) {
        endAnimation();

        if (fieldCardID != -1) {
            // put to player's collect
            player[playerID].addCollect(new_cardID);
            player[playerID].addCollect(fieldCardID);
        } else {
            // put to field
            field.insertCard(fieldID, new_cardID);
        }

        // round end
        // check yaku and check win or next round
        check_win(playerID);
    }
}

function check_win(playerID) {
    const win = player[playerID].check_yaku();

    if (player[CPU].hand.length == 0 && player[PLR].hand.length == 0)
    {
        // end this month
        if (win)
            start_show_yaku(playerID, 0);
        else if (game.koi != -1)
            player_win_month(game.koi);
        else {
            // 親權
            player[game.first].yaku[0] = 1;
            player[game.first].score += data.yaku_score[0];
            player_win_month(game.first);
        }
    } else if (win) {
        // 若是最後一回合 => 強制結束
        if (player[playerID].hand.length == 0)
            player_win_month(playerID);
        // show yaku
        start_show_yaku(playerID, 0);
    } else {
        // next round
        game.round++;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

function start_show_yaku(playerID, yakuID) {
    if (yakuID == player[playerID].new_yaku.length) {
        if (player[playerID].hand.length == 0)
            player_win_month(playerID);
        // ask koi koi or not
        else if (playerID == PLR)
            start_ask_koikoi();
        else // CPU
            cpu_decide_koi();
        return;
    }
    banner.text = yaku_name[player[playerID].new_yaku[yakuID]];
    game.state = gameState.show_yaku_animation;
    // animation
    startTime = performance.now();
    time_func = banner_step();
    next_func = function (time) {
        endAnimation();
        // next yaku
        start_show_yaku(playerID, yakuID + 1)
    }
}

function start_ask_koikoi() {
    // update data
    data.canKoiTime[PLR]++;
    // start draw UI
    game.state = gameState.player_decide_koi;
}

function cpu_decide_koi() {
    // update data
    data.canKoiTime[CPU]++;

    if (Math.floor(Math.random() * 2))
        koikoi(CPU);
    else
        player_win_month(CPU);
}

function player_win_month(playerID) {
    game.winner = playerID;
    game.state = gameState.month_end;
    if (data.seven_bonus && player[playerID].score >= 7)
        player[playerID].money[game.month-1] = player[playerID].score * 2;
    else if (data.koi_bouns)
        player[playerID].money[game.month-1] = player[playerID].score * (player[PLR].koi_time + player[CPU].koi_time + 1);
    else
        player[playerID].money[game.month-1] = player[playerID].score;
    player[playerID].total_money += player[playerID].money[game.month-1];

    // update data
    if (game.koi == playerID)
        data.koiSucessTime[playerID]++;
    data.maxMoneyMonth[playerID] = Math.max(data.maxMoneyMonth[playerID], player[playerID].money[game.month-1]);
    data.totalMoney[playerID] += player[playerID].money[game.month-1];
    data.winMonth[playerID]++;
    // 連勝月
    if (data.lastWinMonth[playerID] > 0) {
        data.lastWinMonth[playerID]++;
        data.maxStreakMonth[playerID] = Math.max(data.lastWinMonth[playerID], data.maxStreakMonth[playerID]);
    } else {
        data.lastWinMonth[playerID] = 1;
        data.lastWinMonth[Number(!playerID)] = 0;
    }
    // yaku
    for (let i = 0; i < YAKU_NUM; i++)
        if (player[playerID].yaku[i] > 0)
            data.yakuTime[playerID][i]++;
}

function draw_decide_koi() {
    // draw panel
    koi_panel.draw();

    // the size of panel of decide koi
    const w = koi_panel.w, h = koi_panel.h;
    // draw texts
    context.fillStyle = 'white';
    context.font = 32 * R + "px 'Yuji Syuku', sans-serif";
    context.fillText("こいこいしますか？", (SCREEN_W/2) * R, (SCREEN_H/2 - h/4) * R);
    context.font = 20 * R + "px 'Yuji Syuku', sans-serif";
    context.fillText(`現在の獲得文数：${player[PLR].score}文`, (SCREEN_W/2) * R, (SCREEN_H/2 - h/24) * R);

    // draw buttons
    end_button.draw();
    koi_button.draw();
}

function koikoi(playerID) {
    // update data
    data.totalKoiTime[playerID]++;
    if (game.koi == playerID)
        data.koiSucessTime[playerID]++;

    game.state = gameState.koikoi_animation;
    game.koi = playerID;
    player[playerID].koi_time++;

    // animation
    startTime = performance.now();
    time_func = banner_step();
    next_func = function (time) {
        endAnimation();
        // next round
        game.round++;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

// show banner UI
function banner_step() {
    return function (time) {
        const duration = (7 * MOVE_TIME);
        const deltaTime = (time - startTime) / duration;
        const open_speed = 6;
        if (deltaTime >= 1) {
            // end
            banner.fillColor = 'rgba(0,0,0,0)';
            banner.borderColor = 'rgba(0,0,0,0)';
            banner.textColor = 'rgba(0,0,0,0)';
            startTime = null;
            time_func = next_func;
        } else if (deltaTime > 0.7) {
            // fade
            const alpha = easeInQuad(time-startTime, 1, -2*(deltaTime-0.6), duration*0.4);
            banner.fillColor = `rgba(255,215,0,${alpha})`;
            banner.borderColor = `rgba(255,255,255,${alpha})`;
            banner.textColor = `rgba(255,0,0,${alpha})`;
        } else if (deltaTime > 0.4) {
            // show 0.2*duration ms
            banner.fillColor = 'gold';
            banner.borderColor = 'white';
            banner.textColor = 'red';
        } else {
            // emerge
            const alpha = easeOutQuad(time-startTime, 0, 4*deltaTime, duration*0.4);
            //banner.fillColor = `rgba(255,215,0,${alpha})`;
            //banner.borderColor = `rgba(255,255,255,${alpha})`;
            banner.fillColor = 'gold';
            banner.borderColor = 'white';
            banner.textColor = `rgba(255,0,0,${alpha})`;
            if (deltaTime <= 1/open_speed) {
                const width = easeInOutQuad(time-startTime, 0, open_speed*(deltaTime), duration/open_speed) * 100;
                banner.y = SCREEN_H/2 - width/2;
                banner.h = width;
            }
        }
    }
}

function draw_show_yaku() {
    yaku_panel.draw();
    const w = yaku_panel.w, h = yaku_panel.h, py = yaku_panel.y;
    // draw who win
    context.fillStyle = 'white';
    const fontsize = 32;
    context.font = fontsize * R + "px 'Yuji Syuku', sans-serif";
    const text = (game.winner == PLR) ? '勝利' : '敗北';
    const title_h = 100;
    context.fillText(text, (SCREEN_W/2) * R, (py + title_h/2) * R);
    // draw yaku
    context.font = 20 * R + "px 'Yuji Syuku', sans-serif";
    let count = 0;
    const max_show = (data.koi_bouns || (data.seven_bonus && player[game.winner].score >= 7)) ? 8 : 9;
    for (let i = 0; i < YAKU_NUM; i++)
        if (player[game.winner].yaku[i] > 0) {
            count++;
            if (count <= max_show) {
                context.fillText(yaku_name[i], (SCREEN_W/2 - w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
                context.fillText(`${player[game.winner].yaku[i] * data.yaku_score[i]}文`, (SCREEN_W/2 + w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
            } else if (count == max_show+1) {
                context.fillText('···', (SCREEN_W/2 - w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
                context.fillText('···', (SCREEN_W/2 + w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
            }
        }
    if (data.koi_bouns) {
        // draw koi koi time
        context.fillText(`こいこい${player[PLR].koi_time+player[CPU].koi_time}次`, (SCREEN_W/2 - w/4) * R, (py + h - title_h/2 - fontsize) * R);
        context.fillText(`x${player[PLR].koi_time+player[CPU].koi_time+1}`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2 - fontsize) * R);
        // draw total score
        context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
        context.fillText(`${player[game.winner].score * (player[PLR].koi_time+player[CPU].koi_time+1)}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
    } else if (data.seven_bonus && player[game.winner].score >= 7) {
        // draw koi koi time
        context.fillText('7点倍', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2 - fontsize) * R);
        context.fillText(`x2`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2 - fontsize) * R);
        // draw total score
        context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
        context.fillText(`${player[game.winner].score * 2}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
    } else {
        context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
        context.fillText(`${player[game.winner].score}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
    }

    // draw button
    if (game.month < data.MAXMONTH)
        next_month_button.draw();
    else
        to_result_button.draw();
}

function result_game() {
    game.winner = (player[PLR].total_money > player[CPU].total_money) ? PLR : CPU;
    game.state = gameState.game_result;

    // update data
    data.maxTotalMoney[PLR] = Math.max(player[PLR].total_money, data.maxTotalMoney[PLR]);
    data.maxTotalMoney[CPU] = Math.max(player[CPU].total_money, data.maxTotalMoney[CPU]);
    data.totalWin[game.winner]++;
    // 對戰連勝
    if (data.totalLastWin[game.winner] > 0) {
        data.totalLastWin[game.winner]++;
        data.totalMaxStreak[game.winner] = Math.max(data.totalLastWin[game.winner], data.totalMaxStreak[game.winner]);
    } else {
        data.totalLastWin[game.winner] = 1;
        data.totalLastWin[Number(!game.winner)] = 0;
    }
    if (data.totalLastWin[game.winner] > 0) {
        data.totalLastWin[game.winner]++;
        data.totalMaxStreak[game.winner] = Math.max(data.totalLastWin[game.winner], data.totalMaxStreak[game.winner]);
    } else {
        data.totalLastWin[game.winner] = 1;
        data.totalLastWin[Number(!game.winner)] = 0;
    }

    // store data
    data.store();
}

function draw_game_result() {
    result_panel.draw();
    const w = result_panel.w, h = result_panel.h, py = result_panel.y;

    // draw who win
    context.fillStyle = 'white';
    const fontsize = 32;
    context.font = fontsize * R + "px 'Yuji Syuku', sans-serif";
    const text = (game.winner == PLR) ? '勝利' : '敗北';
    const title_h = 100;
    context.fillText(text, (SCREEN_W/2) * R, (py + title_h/2) * R);

    // draw scores
    context.font = 20 * R + "px 'Yuji Syuku', sans-serif";
    context.fillText('あなた', (SCREEN_W/2) * R, (py + title_h) * R);
    context.fillText('相手', (SCREEN_W/2 + w/4) * R, (py + title_h) * R);
    for (let i = 1; i <= data.MAXMONTH; i++) {
        context.fillText(`${i}月`, (SCREEN_W/2 - w/4) * R, (py + title_h + i * 24) * R);
        context.fillText((player[PLR].money[i-1] > 0) ? `${player[PLR].money[i-1]}文` : '-',
                         (SCREEN_W/2) * R, (py + title_h + i * 24) * R);
        context.fillText((player[CPU].money[i-1] > 0) ? `${player[CPU].money[i-1]}文` : '-',
                         (SCREEN_W/2 + w/4) * R, (py + title_h + i * 24) * R);
    }
    context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
    context.fillText(`${player[PLR].total_money}文`, (SCREEN_W/2) * R, (py + h - title_h/2) * R);
    context.fillText(`${player[CPU].total_money}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);

    // draw back to home button
    home_button.draw();
}

/* AI的回合 */
function cpu_play() {
    game.state = gameState.cpu_play;

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

    // 如果沒找到可配對的 -> 棄牌
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        for (let i = 1; i < player[CPU].hand.length; i++)
            if (card_type[player[CPU].hand[i]] > card_type[player[CPU].hand[player[CPU].selected_handID]])
                player[CPU].selected_handID = i;
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
                break;
            }
    }
    
    player_play_card(CPU, player[CPU].selected_handID, player[CPU].selected_fieldID);
}

function player_select_hand(handID) {
    card[player[PLR].hand[handID]].selected = true;
    field.update_noticed(Math.floor(player[PLR].hand[handID] / 4));
    player[PLR].selected_handID = handID;
}
function player_unselect_hand(handID) {
    card[player[PLR].hand[handID]].selected = false;
    field.update_noticed(-1);
    player[PLR].selected_handID = -1;
}

//#region Data Upload/Download

/* https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser */
function downloadObjectAsJson(exportObj, exportName) {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", exportName + ".json");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}
/* https://stackoverflow.com/questions/36127648/uploading-a-json-file-and-using-it */
const getJsonUpload = () =>
    new Promise(resolve => {
        const inputFileElement = document.createElement('input');
        inputFileElement.setAttribute('type', 'file');
        inputFileElement.setAttribute('multiple', 'false');
        inputFileElement.setAttribute('accept', '.json');

        inputFileElement.addEventListener(
            'change',
            async (event) => {
                const { files } = event.target;
                if (!files)
                    return;
                const filePromises = [...files].map(file => file.text());
                resolve(await Promise.all(filePromises));
            },
            false,
        );
        inputFileElement.click();
    });
async function uploadData() {
    const jsonFiles = await getJsonUpload();
    let obj;
    try {
        obj = JSON.parse(jsonFiles[0]);
    } catch (error) {
        alert('This is not a JSON file');
        return;
    }
    if (equalObjFormat(data, obj)) {
        Object.assign(data, obj);
        data.store();
        alert('Upload Sucess');
    } else {
        alert('Data Format Error!');
    }
}
function downloadData() {
    downloadObjectAsJson(data, 'HanafudaData');
}

function deleteData() {
    if (confirm("Are you sure to DELETE the Data?")) {
        data.init();
        data.store();
    }
}

//#endregion