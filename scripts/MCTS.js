var MCTSPolicy = {
    MaxPlay: 0,
    WinRate: 0
};
var MCTSTarget = {
    Win: 0,
    Lose: 1
};
var Player = /** @class */ (function () {
    function Player(ID) {
        this.ID = ID;
        this.money = new Array(12); // 文
        for (var i = 0; i < 12; i++)
            this.money[i] = 0;
        this.total_money = 0;
        this.reset_month();
    }
    Player.prototype.reset_month = function () {
        this.hand = new Array(); // 手牌
        this.noticed = new Array();
        this.score = 0; // 當回合分數
        this.collect = [[], [], [], []]; // 玩家獲得的牌
        this.yaku = new Array(YAKU_NUM);
        for (var i = 0; i < YAKU_NUM; i++)
            this.yaku[i] = 0;
        this.new_yaku = new Array();
        this.selected_handID = -1;
        this.selected_fieldID = 0;
        this.needToThrow = false;
        this.draw_cardID = -1;
        this.koi_time = 0;
    };
    Player.prototype.addHand = function (cardID) {
        card[cardID].back = (this.ID == CPU);
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = (this.ID == PLR) ? cardPlace.player_hand : cardPlace.cpu_hand;
        this.hand.push(cardID);
    };
    Player.prototype.removeHand = function (handID) {
        card[this.hand[handID]].back = false;
        card[this.hand[handID]].noticed = false;
        card[this.hand[handID]].selected = false;
        card[this.hand[handID]].place = cardPlace.moving;
        for (var i = handID; i < this.hand.length - 1; i++)
            this.hand[i] = this.hand[i + 1];
        this.hand.pop();
        this.selected_handID = -1;
    };
    Player.prototype.addCollect = function (cardID) {
        card[cardID].back = false;
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = (this.ID == PLR) ? cardPlace.player_collect : cardPlace.cpu_collect;
        this.collect[card_type[cardID]].push(cardID);
    };
    Player.prototype.update_noticed = function () {
        this.needToThrow = true;
        for (var i = 0; i < this.hand.length; i++)
            for (var _i = 0, _a = field.card; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c < 0)
                    continue;
                if (Math.floor(c / 4) == Math.floor(this.hand[i] / 4)) {
                    this.noticed[i] = true;
                    card[this.hand[i]].noticed = true;
                    this.needToThrow = false;
                    break;
                }
                this.noticed[i] = false;
                card[this.hand[i]].noticed = false;
            }
        for (var _b = 0, _c = this.collect; _b < _c.length; _b++) {
            var arr = _c[_b];
            for (var _d = 0, arr_1 = arr; _d < arr_1.length; _d++) {
                var c = arr_1[_d];
                card[c].noticed = false;
                card[c].back = false;
            }
        }
    };
    Player.prototype.update_card_info = function () {
        this.update_noticed();
        for (var i = 0; i < this.hand.length; i++) {
            // update hand card px, py
            card[this.hand[i]].px = SCREEN_W / 2 + (CARD_W + CARD_GAP * 2) * (i - this.hand.length / 2) + CARD_GAP;
            if (this.ID == PLR)
                card[this.hand[i]].py = SCREEN_H - (CARD_H + CARD_GAP * 2) + CARD_GAP;
            else // ID == CPU
                card[this.hand[i]].py = CARD_GAP;
            // update hand card showing or not
            card[this.hand[i]].back = (!game.op && this.ID == CPU);
        }
        // update collected card px, py
        for (var i = 0; i < this.collect.length; i++)
            for (var j = 0; j < this.collect[i].length; j++) {
                if (i < this.collect.length / 2)
                    card[this.collect[i][j]].px = SCREEN_W - (CARD_W + CARD_GAP * 2) - (CARD_W + CARD_GAP * 2) * (2 * j / this.collect[i].length) + CARD_GAP;
                else
                    card[this.collect[i][j]].px = (CARD_W + CARD_GAP * 2) * (2 * j / this.collect[i].length) + CARD_GAP;
                card[this.collect[i][j]].py = this.getNewColloectY(i);
            }
    };
    Player.prototype.getNewColloectX = function (i) {
        if (i < this.collect.length / 2)
            return SCREEN_W - (CARD_W + CARD_GAP * 2) - (CARD_W + CARD_GAP * 2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
        return (CARD_W + CARD_GAP * 2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
    };
    Player.prototype.getNewColloectY = function (i) {
        if (this.ID == PLR) {
            if (i % 2 == 0)
                return SCREEN_H - (CARD_H + CARD_GAP * 2) + CARD_GAP;
            return SCREEN_H - 2 * (CARD_H + CARD_GAP * 2) + CARD_GAP;
        }
        else { // ID == CPU
            if (i % 2 == 0)
                return (CARD_H + CARD_GAP * 2) + CARD_GAP;
            return CARD_GAP;
        }
    };
    Player.prototype.pointedCollectIndex = function () {
        for (var i = 0; i < 4; i++)
            for (var _i = 0, _a = this.collect[i]; _i < _a.length; _i++) {
                var c = _a[_i];
                if (mouse.x >= card[c].px && mouse.x <= card[c].px + CARD_W &&
                    mouse.y >= card[c].py && mouse.y <= card[c].py + CARD_H)
                    return i;
            }
        return -1;
    };
    /* 結算役 */
    // 回傳是否有新的役
    Player.prototype.check_yaku = function () {
        var light = this.collect[3].length;
        var seed = this.collect[2].length;
        var ribbon = this.collect[1].length;
        var dross = this.collect[0].length;
        // see : yaku_name
        var now_yaku = new Array(YAKU_NUM);
        for (var i = 0; i < YAKU_NUM; i++)
            now_yaku[i] = 0;
        var rain = 0; // 雨
        var fog = 0; // 霧(桐上鳳凰)
        var kiku = 0; // 菊上杯
        var matsukiribozu = 0; // 松桐坊主
        var sugawara = 0; // 表菅原
        var inoshikacho = 0; // 猪鹿蝶
        var gotori = 0; // 五鳥
        var akatan = 0; // 赤短
        var aotan = 0; // 青短
        var getsusatsu = 0; // 月札
        var hanamideippai = 0; // 花見酒
        var tsukimideippai = 0; // 月見酒
        var kusa = 0; // 草短
        var yanaginitanzaku = 0; // 柳上短冊
        for (var _i = 0, _a = this.collect; _i < _a.length; _i++) {
            var arr = _a[_i];
            for (var _b = 0, arr_2 = arr; _b < arr_2.length; _b++) {
                var c = arr_2[_b];
                if (c == 40)
                    rain++;
                if (c == 44)
                    fog++;
                if (c == 41)
                    yanaginitanzaku++;
                if (c == 8 || c == 32)
                    hanamideippai++;
                if (c == 28 || c == 32)
                    tsukimideippai++;
                if (c == 0 || c == 28 || c == 44)
                    matsukiribozu++;
                if (c == 0 || c == 4 || c == 8)
                    sugawara++;
                if (c == 20 || c == 24 || c == 36)
                    inoshikacho++;
                if (c == 4 || c == 12 || c == 29)
                    gotori++;
                if (c == 1 || c == 5 || c == 9)
                    akatan++;
                if (c == 21 || c == 33 || c == 37)
                    aotan++;
                if (c == 13 || c == 17 || c == 25)
                    kusa++;
                if (Math.floor(c / 4) == game.month - 1)
                    getsusatsu++;
            }
        }
        if (light == 5)
            now_yaku[1] += 1; // 五光
        if (light == 4 && rain == 0)
            now_yaku[2] += 1; // 四光
        if (light == 4 && rain == 1)
            now_yaku[3] += 1; // 雨四光
        if (light == 3 && rain == 0)
            now_yaku[4] += 1; // 三光
        if (data.matsukiribozu && matsukiribozu == 3)
            now_yaku[5] += 1; // 松桐坊主
        if (data.sugawara && sugawara == 3)
            now_yaku[6] += 1; // 表菅原
        if (data.flower_moon_sake && hanamideippai + tsukimideippai == 4)
            now_yaku[7] += 1; // 飲み
        if (data.flower_sake && hanamideippai == 2)
            now_yaku[8] += 1; // 花見で一杯
        if (data.moon_sake && tsukimideippai == 2)
            now_yaku[9] += 1; // 月見で一杯
        if (data.inoshikacho && inoshikacho == 3)
            now_yaku[10] += 1; // 猪鹿蝶
        if (data.five_bird && gotori == 3)
            now_yaku[11] += 1; // 五鳥
        if (data.seven_tan && ribbon - yanaginitanzaku >= 7)
            now_yaku[12] += 1; // 七短
        if (data.six_tan && ribbon - yanaginitanzaku >= 6)
            now_yaku[13] += 1; // 六短
        if (data.akatan_aotan && akatan + aotan == 6)
            now_yaku[14] += 1; // 赤短・青短の重複役
        if (data.akatan && akatan == 3)
            now_yaku[15] += 1; // 赤短
        if (data.aotan && aotan == 3)
            now_yaku[16] += 1; // 青短
        if (data.grass && kusa == 3)
            now_yaku[17] += 1; // 草
        if (data.month_yaku && getsusatsu == 4)
            now_yaku[18] += 1; // 月札
        if (seed + Number(data.kiku_dross && kiku == 1) >= 5)
            now_yaku[19] += seed - 4; // タネ
        if (ribbon >= 5)
            now_yaku[20] += ribbon - 4; // 短冊
        if (dross >= 10)
            now_yaku[21] += dross - 9; // カス
        // 不能同時出現的役
        if (!data.light_accumulate && now_yaku[1] > 0)
            now_yaku[2] = now_yaku[3] = now_yaku[4] = 0; // 五光 四光 雨四光 三光
        if (!data.light_accumulate && (now_yaku[2] > 0 || now_yaku[3] > 0))
            now_yaku[4] = 0; // 四光/雨四光 三光
        if (!data.tan_accumulate && (now_yaku[12] > 0 || now_yaku[13] > 0))
            now_yaku[20] = 0; // 七短/六短 短冊
        if (now_yaku[12] > 0)
            now_yaku[13] = 0; // 七短 六短
        if ((data.rain_rule && rain > 0) || (data.fog_rule && fog > 0) || (!data.flower_moon_sake_accumulate && now_yaku[7] > 0))
            now_yaku[8] = now_yaku[9] = 0; // 飲み 花見で一杯 月見で一杯
        if (!data.akatan_aotan_accumulate && now_yaku[14] > 0)
            now_yaku[15] = now_yaku[16] = 0; // 赤短・青短の重複役 赤短 青短
        while (this.new_yaku.length > 0)
            this.new_yaku.pop();
        this.score = 0;
        var get_new_yaku = false;
        for (var i = 0; i < YAKU_NUM; i++) {
            // check is there new yaku
            if (now_yaku[i] > this.yaku[i]) {
                if (!(data.flower_moon_sake_bonus && (i == 8 || i == 9)))
                    get_new_yaku = true;
                this.new_yaku.push(i);
            }
            // copy now yaku to old yaku
            this.yaku[i] = now_yaku[i];
            // calculate new score
            this.score += data.yaku_score[i] * now_yaku[i];
        }
        if (!data.koi_lower_2 && this.score <= 2)
            return false;
        return get_new_yaku;
    };
    return Player;
}());
var MCTSMove = /** @class */ (function () {
    function MCTSMove(handCardID, fieldCardID) {
        this.hand = handCardID;
        this.field = fieldCardID;
    }
    return MCTSMove;
}());
var MCTSState = /** @class */ (function () {
    function MCTSState(playerID, deck, field, PLR, CPU) {
        this.playerID = playerID;
        this.deck = deck;
        this.field = field;
        this.player = [PLR, CPU];
    }
    return MCTSState;
}());
var MCTSNode = /** @class */ (function () {
    function MCTSNode(parent, move, state) {
        this.state = state;
        this.parentMove = move;
        this.parentScore = 0;
        this.totalPlay = 0;
        this.parent = parent;
        this.children = new Array();
    }
    MCTSNode.prototype.UCB1 = function (UCB1ExploreParam) {
        if (this.parent === null)
            return 0;
        if (this.totalPlay == 0) // if this node has not explored yet
            return Infinity;
        if (this.parentScore < 0)
            return this.parentScore;
        var exploit = this.parentScore / this.totalPlay;
        var explore = Math.sqrt(Math.log(this.parent.totalPlay) / this.totalPlay);
        return exploit + UCB1ExploreParam * explore;
    };
    MCTSNode.prototype.FindMaxUCB1Child = function (UCB1ExploreParam) {
        if (this.children.length == 0)
            throw new Error("no child");
        var res;
        var maxUCB = -Infinity;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var n = _a[_i];
            var newUCB = n.UCB1(UCB1ExploreParam);
            if (newUCB > maxUCB) {
                res = n;
                maxUCB = newUCB;
            }
        }
        return res;
    };
    MCTSNode.prototype.GetRandomChild = function () {
        return this.children[randomInt(0, this.children.length - 1)];
    };
    return MCTSNode;
}());
function get_root_MCTS_state() {
    var plr = new Player(PLR);
    var cpu = new Player(CPU);
    plr.hand = player[PLR].hand.slice();
    cpu.hand = player[CPU].hand.slice();
    for (var i = 0; i < 4; i++) {
        plr.collect[i] = player[PLR].collect[i].slice();
        cpu.collect[i] = player[CPU].collect[i].slice();
    }
    var f = new Array();
    for (var _i = 0, _a = field.card; _i < _a.length; _i++) {
        var c = _a[_i];
        if (c < 0)
            continue;
        f.push(c);
    }
    return new MCTSState(CPU, deck.slice(), f, plr, cpu);
}
function get_legal_moves(state) {
    // console.log(state);
    var moves = new Array();
    for (var _i = 0, _a = state.player[state.playerID].hand; _i < _a.length; _i++) {
        var h = _a[_i];
        for (var _b = 0, _c = state.field; _b < _c.length; _b++) {
            var f = _c[_b];
            if (f < 0)
                continue;
            if (Math.floor(h / 4) == Math.floor(f / 4))
                moves.push(new MCTSMove(h, f));
        }
    }
    // 棄牌
    if (moves.length == 0) {
        for (var _d = 0, _e = state.player[state.playerID].hand; _d < _e.length; _d++) {
            var h = _e[_d];
            moves.push(new MCTSMove(h, -1));
        }
    }
    return moves;
}
function get_next_MCTS_state(state, move) {
    // console.log(state, move);
    var f = state.field.slice();
    if (move.field >= 0)
        arr_remove(f, move.field);
    else
        f.push(move.hand);
    var plr = new Player(PLR);
    var cpu = new Player(CPU);
    plr.hand = state.player[PLR].hand.slice();
    cpu.hand = state.player[CPU].hand.slice();
    for (var i = 0; i < 4; i++) {
        plr.collect[i] = state.player[PLR].collect[i].slice();
        cpu.collect[i] = state.player[CPU].collect[i].slice();
    }
    var next = new MCTSState(1 - state.playerID, state.deck.slice(), f, plr, cpu);
    arr_remove(next.player[state.playerID].hand, move.hand);
    if (move.field >= 0) {
        next.player[state.playerID].collect[card_type[move.hand]].push(move.hand);
        next.player[state.playerID].collect[card_type[move.field]].push(move.field);
    }
    // draw new card
    var drawed = next.deck.pop();
    if (drawed === undefined)
        return next;
    var fi = new Array();
    for (var _i = 0, _a = next.field; _i < _a.length; _i++) {
        var fj = _a[_i];
        if (fj < 0)
            continue;
        if (Math.floor(drawed / 4) == Math.floor(fj / 4))
            fi.push(fj);
    }
    if (fi.length > 0) {
        // choose random card
        var r = randomInt(0, fi.length - 1);
        arr_remove(next.field, fi[r]);
        next.player[state.playerID].collect[card_type[fi[r]]].push(fi[r]);
        next.player[state.playerID].collect[card_type[drawed]].push(drawed);
    }
    else {
        next.field.push(drawed);
    }
    return next;
}
function check_MCTS_winner(state) {
    if (state.player[PLR].check_yaku())
        return PLR;
    if (state.player[CPU].check_yaku())
        return CPU;
    if (state.player[CPU].hand.length == 0 && state.player[PLR].hand.length == 0) {
        if (game.koi != -1) {
            // 正在koikoi者勝利
            return game.koi;
        }
        else if (data.first_priority) {
            // 親權
            state.player[game.first].yaku[0] = 1;
            state.player[game.first].score += data.yaku_score[0];
            return game.first;
        }
        else {
            // 平手
            return -1;
        }
    }
    // 遊戲還沒結束
    return -2;
}
function MCTS_select(root, UCB1ExploreParam) {
    while (root.children.length !== 0)
        root = root.FindMaxUCB1Child(UCB1ExploreParam);
    return root;
}
function MCTS_expand(leaf) {
    if (leaf.children.length != 0)
        return;
    var possibleMoves = get_legal_moves(leaf.state);
    for (var _i = 0, possibleMoves_1 = possibleMoves; _i < possibleMoves_1.length; _i++) {
        var move = possibleMoves_1[_i];
        var stateAfterPlay = get_next_MCTS_state(leaf.state, move);
        leaf.children.push(new MCTSNode(leaf, move, stateAfterPlay));
    }
}
function MCTS_rollout(leaf, root) {
    var state = leaf.state;
    var winner = check_MCTS_winner(state);
    if (winner == leaf.state.player && winner == 1 - root.state.playerID)
        leaf.parentScore = -2;
    if (leaf.parent !== null && winner == leaf.parent.state.player && winner == 1 - root.state.playerID)
        leaf.parent.parentScore = -1;
    while (winner === -2) {
        var possibleMoves = get_legal_moves(state);
        // if (possibleMoves.length == 0)
        //     console.log(state);
        var move = possibleMoves[randomInt(0, possibleMoves.length - 1)];
        state = get_next_MCTS_state(state, move);
        winner = check_MCTS_winner(state);
    }
    return winner;
}
function MCTS_backpropogate(leaf, winner, target) {
    if (target === void 0) { target = MCTSTarget.Win; }
    var node = leaf;
    var score = leaf.state.player[winner].score;
    // const score = 1;
    while (node !== null) {
        if ((node.state.playerID == 1 - winner && target == MCTSTarget.Win) ||
            (node.state.playerID == winner && target == MCTSTarget.Lose))
            node.parentScore += score;
        node.totalPlay++;
        node = node.parent;
    }
}
function MCTS_iterate(root, UCB1ExploreParam, target) {
    if (target === void 0) { target = MCTSTarget.Win; }
    var leaf = MCTS_select(root, UCB1ExploreParam);
    // console.log("select ", leaf);
    var winner = check_MCTS_winner(leaf.state);
    if (winner == -2) {
        // console.log("needExpand ", leaf);
        MCTS_expand(leaf);
        leaf = leaf.GetRandomChild();
    }
    // console.log(leaf);
    winner = MCTS_rollout(leaf, root);
    MCTS_backpropogate(leaf, winner, target);
    // winner = MCTS_rollout(leaf, root);
    // MCTS_backpropogate(leaf, winner);
}
function MCTS_get_best_move(root, policy) {
    if (policy === void 0) { policy = MCTSPolicy.MaxPlay; }
    var bestPlay = null;
    var max = -Infinity;
    for (var _i = 0, _a = root.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (policy == MCTSPolicy.MaxPlay && child.totalPlay > max) {
            bestPlay = child.parentMove;
            max = child.totalPlay;
        }
        else if (policy == MCTSPolicy.WinRate) {
            var rate = child.parentScore / child.totalPlay;
            if (rate > max) {
                bestPlay = child.parentMove;
                max = rate;
            }
        }
    }
    if (bestPlay === null) {
        console.log(root.children);
        throw new Error("Play not found");
    }
    return bestPlay;
}
function MCTS_search(iteration, UCB1ExploreParam, target, policy) {
    if (target === void 0) { target = MCTSTarget.Win; }
    if (policy === void 0) { policy = MCTSPolicy.MaxPlay; }
    var root = new MCTSNode(null, null, get_root_MCTS_state());
    // console.log(root.state);
    while (iteration-- > 0)
        MCTS_iterate(root, UCB1ExploreParam, target);
    // console.log(root);
    return MCTS_get_best_move(root, policy);
}
function test(iteration, UCB1ExploreParam) {
    var first = randomInt(0, 1);
    var deck = [];
    var field = [];
    var plr = new Player(PLR);
    var cpu = new Player(CPU);
    for (var i = 0; i < 48; i++) {
        deck.push(i);
    }
    shuffle_deck(deck);
    for (var i = 0; i < HAND_NUM; i++) {
        var c = deck.pop();
        if (c !== undefined)
            field.push(c);
    }
    for (var i = 0; i < HAND_NUM; i++) {
        var c = deck.pop();
        if (c !== undefined)
            plr.hand.push(c);
    }
    for (var i = 0; i < HAND_NUM; i++) {
        var c = deck.pop();
        if (c !== undefined)
            cpu.hand.push(c);
    }
    var state = new MCTSState(first, deck, field, plr, cpu);
    // console.log(state);
    var winner = check_MCTS_winner(state);
    while (winner == -2) {
        if (state.playerID === CPU) {
            var root = new MCTSNode(null, null, state);
            var i = iteration;
            while (i-- > 0)
                MCTS_iterate(root, UCB1ExploreParam);
            var move = MCTS_get_best_move(root);
            state = get_next_MCTS_state(state, move);
        }
        else {
            /* random */
            var moves = get_legal_moves(state);
            var move = moves[randomInt(0, moves.length - 1)];
            state = get_next_MCTS_state(state, move);
        }
        // console.log(state);
        winner = check_MCTS_winner(state);
    }
    // console.log(winner);
    return winner;
}
function testAI(times, iteration, UCB1ExploreParam) {
    var win = 0;
    var total = times;
    while (times-- > 0) {
        if (test(iteration, UCB1ExploreParam) == CPU)
            win++;
    }
    return win / total;
}
