const MCTSPolicy = {
    MaxPlay: 0,
    WinRate: 0
}
const MCTSTarget = {
    Win: 0,
    Lose: 1
}

class Player {
    public ID: number;
    public money: number[];
    public total_money: number;
    public hand: number[];
    public noticed: boolean[];
    public score: number;
    public collect: number[][];
    public yaku: number[];
    public new_yaku: number[];
    public selected_handID: number;
    public selected_fieldID: number;
    public needToThrow: boolean;
    public draw_cardID: number;
    public koi_time: number;

    constructor(ID: number) {
        this.ID = ID;
        this.money = new Array(12); // 文
        for (let i = 0; i < 12; i++)
            this.money[i] = 0;
        this.total_money = 0;
        this.reset_month();
    }

    reset_month() {
        this.hand = new Array(); // 手牌
        this.noticed = new Array();
        this.score = 0; // 當回合分數
        this.collect = [[], [], [], []]; // 玩家獲得的牌
        this.yaku = new Array(YAKU_NUM);
        for (let i = 0; i < YAKU_NUM; i++)
            this.yaku[i] = 0;
        this.new_yaku = new Array();
        this.selected_handID = -1;
        this.selected_fieldID = 0;
        this.needToThrow = false;
        this.draw_cardID = -1;
        this.koi_time = 0;
    }

    addHand(cardID: number) {
        card[cardID].back = (this.ID == CPU);
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = (this.ID == PLR) ? cardPlace.player_hand : cardPlace.cpu_hand;
        this.hand.push(cardID);
    }

    removeHand(handID: number) {
        card[this.hand[handID]].back = false;
        card[this.hand[handID]].noticed = false;
        card[this.hand[handID]].selected = false;
        card[this.hand[handID]].place = cardPlace.moving;
        for (let i = handID; i < this.hand.length - 1; i++)
            this.hand[i] = this.hand[i + 1];
        this.hand.pop();
        this.selected_handID = -1;
    }

    addCollect(cardID: number) {
        card[cardID].back = false;
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = (this.ID == PLR) ? cardPlace.player_collect : cardPlace.cpu_collect;
        this.collect[card_type[cardID]].push(cardID);
    }

    update_noticed() {
        this.needToThrow = true;
        for (let i = 0; i < this.hand.length; i++)
            for (const c of field.card) {
                if (c < 0) continue;
                if (Math.floor(c / 4) == Math.floor(this.hand[i] / 4)) {
                    this.noticed[i] = true;
                    card[this.hand[i]].noticed = true;
                    this.needToThrow = false;
                    break;
                }
                this.noticed[i] = false;
                card[this.hand[i]].noticed = false;
            }
        for (const arr of this.collect)
            for (const c of arr) {
                card[c].noticed = false;
                card[c].back = false;
            }
    }

    update_card_info() {
        this.update_noticed();
        for (let i = 0; i < this.hand.length; i++) {
            // update hand card px, py
            card[this.hand[i]].px = SCREEN_W / 2 + (CARD_W+CARD_GAP*2) * (i - this.hand.length / 2) + CARD_GAP;
            if (this.ID == PLR)
                card[this.hand[i]].py = SCREEN_H - (CARD_H+CARD_GAP*2) + CARD_GAP;
            else // ID == CPU
                card[this.hand[i]].py = CARD_GAP;
            // update hand card showing or not
            card[this.hand[i]].back = (!game.op && this.ID == CPU);
        }
        // update collected card px, py
        for (let i = 0; i < this.collect.length; i++)
            for (let j = 0; j < this.collect[i].length; j++) {
                if (i < this.collect.length / 2)
                    card[this.collect[i][j]].px = SCREEN_W - (CARD_W+CARD_GAP*2) - (CARD_W+CARD_GAP*2) * (2 * j / this.collect[i].length) + CARD_GAP;
                else card[this.collect[i][j]].px = (CARD_W+CARD_GAP*2) * (2 * j / this.collect[i].length) + CARD_GAP;
                card[this.collect[i][j]].py = this.getNewColloectY(i);
            }
    }

    getNewColloectX(i: number) {
        if (i < this.collect.length / 2)
            return SCREEN_W - (CARD_W+CARD_GAP*2) - (CARD_W+CARD_GAP*2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
        return (CARD_W+CARD_GAP*2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
    }

    getNewColloectY(i: number) {
        if (this.ID == PLR) {
            if (i % 2 == 0)
                return SCREEN_H - (CARD_H+CARD_GAP*2) + CARD_GAP;
            return SCREEN_H - 2 * (CARD_H+CARD_GAP*2) + CARD_GAP;
        } else { // ID == CPU
            if (i % 2 == 0)
                return (CARD_H+CARD_GAP*2) + CARD_GAP;
            return CARD_GAP;
        }
    }

    pointedCollectIndex() {
        for (let i = 0; i < 4; i++)
            for (const c of this.collect[i])
                if (mouse.x >= card[c].px && mouse.x <= card[c].px + CARD_W &&
                    mouse.y >= card[c].py && mouse.y <= card[c].py + CARD_H)
                    return i;
        return -1;
    }

    /* 結算役 */
    // 回傳是否有新的役
    check_yaku() {
        const light  = this.collect[3].length;
        const seed   = this.collect[2].length;
        const ribbon = this.collect[1].length;
        const dross  = this.collect[0].length;

        // see : yaku_name
        let now_yaku = new Array(YAKU_NUM);
        for (let i = 0; i < YAKU_NUM; i++)
            now_yaku[i] = 0;

        let rain = 0; // 雨
        let fog = 0; // 霧(桐上鳳凰)
        let kiku = 0; // 菊上杯
        let matsukiribozu = 0; // 松桐坊主
        let sugawara = 0; // 表菅原
        let inoshikacho = 0; // 猪鹿蝶
        let gotori = 0; // 五鳥
        let akatan = 0; // 赤短
        let aotan = 0; // 青短
        let getsusatsu = 0; // 月札
        let hanamideippai = 0; // 花見酒
        let tsukimideippai = 0; // 月見酒
        let kusa = 0; // 草短
        let yanaginitanzaku = 0; // 柳上短冊

        for (const arr of this.collect)
            for (const c of arr) {
                if (c == 40) rain++;
                if (c == 44) fog++;
                if (c == 41) yanaginitanzaku++;
                if (c ==  8 || c == 32) hanamideippai++;
				if (c == 28 || c == 32) tsukimideippai++;
                if (c ==  0 || c == 28 || c == 44) matsukiribozu++;
                if (c ==  0 || c ==  4 || c ==  8) sugawara++;
                if (c == 20 || c == 24 || c == 36) inoshikacho++;
                if (c ==  4 || c == 12 || c == 29) gotori++;
                if (c ==  1 || c ==  5 || c ==  9) akatan++;
                if (c == 21 || c == 33 || c == 37) aotan++;
                if (c == 13 || c == 17 || c == 25) kusa++;
                if (Math.floor(c/4) == game.month-1) getsusatsu++;
            }

        if (light              == 5 ) now_yaku[ 1] += 1; // 五光
        if (light == 4 && rain == 0 ) now_yaku[ 2] += 1; // 四光
        if (light == 4 && rain == 1 ) now_yaku[ 3] += 1; // 雨四光
        if (light == 3 && rain == 0 ) now_yaku[ 4] += 1; // 三光
        if (data.matsukiribozu    && matsukiribozu                  == 3) now_yaku[ 5] += 1; // 松桐坊主
        if (data.sugawara         && sugawara                       == 3) now_yaku[ 6] += 1; // 表菅原
        if (data.flower_moon_sake && hanamideippai + tsukimideippai == 4) now_yaku[ 7] += 1; // 飲み
        if (data.flower_sake      && hanamideippai                  == 2) now_yaku[ 8] += 1; // 花見で一杯
        if (data.moon_sake        && tsukimideippai                 == 2) now_yaku[ 9] += 1; // 月見で一杯
        if (data.inoshikacho      && inoshikacho                    == 3 ) now_yaku[10] += 1; // 猪鹿蝶
        if (data.five_bird        && gotori                         == 3) now_yaku[11] += 1; // 五鳥
        if (data.seven_tan        && ribbon - yanaginitanzaku       >= 7) now_yaku[12] += 1; // 七短
        if (data.six_tan          && ribbon - yanaginitanzaku       >= 6) now_yaku[13] += 1; // 六短
        if (data.akatan_aotan     && akatan + aotan                 == 6) now_yaku[14] += 1; // 赤短・青短の重複役
        if (data.akatan           && akatan                         == 3) now_yaku[15] += 1; // 赤短
        if (data.aotan            && aotan                          == 3) now_yaku[16] += 1; // 青短
        if (data.grass            && kusa                           == 3) now_yaku[17] += 1; // 草
        if (data.month_yaku       && getsusatsu                     == 4) now_yaku[18] += 1; // 月札
        if (seed + Number(data.kiku_dross && kiku == 1) >=  5) now_yaku[19] += seed - 4; // タネ
        if (ribbon                                      >=  5) now_yaku[20] += ribbon - 4; // 短冊
        if (dross                                       >= 10) now_yaku[21] += dross  - 9; // カス

        // 不能同時出現的役
        if (!data.light_accumulate &&  now_yaku[ 1] > 0) now_yaku[ 2] = now_yaku[ 3] = now_yaku[ 4] = 0; // 五光 四光 雨四光 三光
        if (!data.light_accumulate && (now_yaku[ 2] > 0 || now_yaku[ 3] > 0)) now_yaku[ 4] = 0; // 四光/雨四光 三光
        if (!data.tan_accumulate   && (now_yaku[12] > 0 || now_yaku[13] > 0)) now_yaku[20] = 0; // 七短/六短 短冊
        if (now_yaku[12] > 0) now_yaku[13] = 0; // 七短 六短
        if ((data.rain_rule && rain > 0) || (data.fog_rule && fog > 0) || (!data.flower_moon_sake_accumulate && now_yaku[ 7] > 0)) now_yaku[ 8] = now_yaku[ 9] = 0; // 飲み 花見で一杯 月見で一杯
        if (!data.akatan_aotan_accumulate && now_yaku[14] > 0) now_yaku[15] = now_yaku[16] = 0; // 赤短・青短の重複役 赤短 青短

        while (this.new_yaku.length > 0)
            this.new_yaku.pop();

        this.score = 0;
        let get_new_yaku = false;
        for (let i = 0; i < YAKU_NUM; i++) {
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
    }
}

class MCTSMove {
    public hand: number;
    public field: number;
    constructor(handCardID: number, fieldCardID: number) {
        this.hand = handCardID;
        this.field = fieldCardID;
    }
}

class MCTSState {
    public playerID: number;
    public deck: number[];
    public field: number[];
    public player: Player[];
    constructor(playerID: number, deck: number[], field: any[], PLR: Player, CPU: Player) {
        this.playerID = playerID;
        this.deck = deck;
        this.field = field;
        this.player = [PLR, CPU];
    }
}

class MCTSNode {
    public state: MCTSState;
    public parentMove: MCTSMove | null;
    public parentScore: number;
    public totalPlay: number;
    public parent: MCTSNode | null;
    public children: MCTSNode[];
    constructor(parent: MCTSNode | null, move: MCTSMove | null, state: MCTSState) {
        this.state = state;
        this.parentMove = move;
        this.parentScore = 0;
        this.totalPlay = 0;
        this.parent = parent;
        this.children = new Array();
    }

    UCB1(UCB1ExploreParam: number)
    {
        if (this.parent === null)
            return 0;
        if (this.totalPlay == 0) // if this node has not explored yet
            return Infinity;
        if (this.parentScore < 0)
            return this.parentScore;
        const exploit = this.parentScore / this.totalPlay;
        const explore = Math.sqrt(Math.log(this.parent.totalPlay) / this.totalPlay);
        return exploit + UCB1ExploreParam * explore;
    }

    FindMaxUCB1Child(UCB1ExploreParam: number)
    {
        if (this.children.length == 0)
            throw new Error("no child");
        let res;
        let maxUCB = -Infinity;
        for (const n of this.children)
        {
            const newUCB = n.UCB1(UCB1ExploreParam);
            if (newUCB > maxUCB)
            {
                res = n;
                maxUCB = newUCB;
            }
        }
        return res;
    }

    GetRandomChild() {
        return this.children[randomInt(0, this.children.length - 1)];
    }
}

function get_root_MCTS_state() {
    const plr = new Player(PLR);
    const cpu = new Player(CPU);
    plr.hand = player[PLR].hand.slice();
    cpu.hand = player[CPU].hand.slice();
    for (let i = 0; i < 4; i++) {
        plr.collect[i] = player[PLR].collect[i].slice();
        cpu.collect[i] = player[CPU].collect[i].slice();
    }
    const f = new Array();
    for (const c of field.card) {
        if (c < 0) continue;
        f.push(c);
    }
    return new MCTSState(CPU, deck.slice(), f, plr, cpu);
}

function get_legal_moves(state: MCTSState) {
    // console.log(state);

    const moves = new Array();
    for (const h of state.player[state.playerID].hand)
        for (const f of state.field) {
            if (f < 0) continue;
            if (Math.floor(h / 4) == Math.floor(f / 4))
                moves.push(new MCTSMove(h, f));
        }
    // 棄牌
    if (moves.length == 0) {
        for (const h of state.player[state.playerID].hand)
            moves.push(new MCTSMove(h, -1));
    }
    return moves;
}

function get_next_MCTS_state(state: MCTSState, move: MCTSMove) {
    // console.log(state, move);

    const f = state.field.slice();
    if (move.field >= 0)
        arr_remove(f, move.field);
    else
        f.push(move.hand);
    const plr = new Player(PLR);
    const cpu = new Player(CPU);
    plr.hand = state.player[PLR].hand.slice();
    cpu.hand = state.player[CPU].hand.slice();
    for (let i = 0; i < 4; i++) {
        plr.collect[i] = state.player[PLR].collect[i].slice();
        cpu.collect[i] = state.player[CPU].collect[i].slice();
    }

    const next = new MCTSState(1 - state.playerID, state.deck.slice(), f, plr, cpu);

    arr_remove(next.player[state.playerID].hand, move.hand);
    if (move.field >= 0) {
        next.player[state.playerID].collect[card_type[move.hand]].push(move.hand);
        next.player[state.playerID].collect[card_type[move.field]].push(move.field);
    }

    // draw new card
    const drawed = next.deck.pop();
    if (drawed === undefined)
        return next;

    const fi = new Array();
    for (const fj of next.field) {
        if (fj < 0) continue;
        if (Math.floor(drawed / 4) == Math.floor(fj / 4))
            fi.push(fj);
    }
    if (fi.length > 0) {
        // choose random card
        const r = randomInt(0, fi.length - 1);
        arr_remove(next.field, fi[r]);
        next.player[state.playerID].collect[card_type[fi[r]]].push(fi[r]);
        next.player[state.playerID].collect[card_type[drawed]].push(drawed);
    } else {
        next.field.push(drawed);
    }

    return next;
}

function check_MCTS_winner(state: MCTSState) {
    if (state.player[PLR].check_yaku())
        return PLR;
    if (state.player[CPU].check_yaku())
        return CPU;
    if (state.player[CPU].hand.length == 0 && state.player[PLR].hand.length == 0) {
        if (game.koi != -1) {
            // 正在koikoi者勝利
            return game.koi;
        } else if (data.first_priority) {
            // 親權
            state.player[game.first].yaku[0] = 1;
            state.player[game.first].score += data.yaku_score[0];
            return game.first;
        } else {
            // 平手
            return -1;
        }
    }
    // 遊戲還沒結束
    return -2;
}

function MCTS_select(root: MCTSNode, UCB1ExploreParam: number): MCTSNode {
    while (root.children.length !== 0)
        root = root.FindMaxUCB1Child(UCB1ExploreParam);
    return root;
}

function MCTS_expand(leaf: MCTSNode) {
    if (leaf.children.length != 0)
        return;
    const possibleMoves = get_legal_moves(leaf.state);
    for (const move of possibleMoves)
    {
        const stateAfterPlay = get_next_MCTS_state(leaf.state, move);
        leaf.children.push(new MCTSNode(leaf, move, stateAfterPlay));
    }
}

function MCTS_rollout(leaf: MCTSNode, root: MCTSNode) {
    let state = leaf.state;
    let winner = check_MCTS_winner(state);

    if (winner == leaf.state.player && winner == 1 - root.state.playerID)
        leaf.parentScore = -2;
    
    if (leaf.parent !== null && winner == leaf.parent.state.player && winner == 1 - root.state.playerID)
        leaf.parent.parentScore = -1;

    while (winner === -2) {
        const possibleMoves = get_legal_moves(state);
        // if (possibleMoves.length == 0)
        //     console.log(state);
        const move = possibleMoves[randomInt(0, possibleMoves.length - 1)];

        state = get_next_MCTS_state(state, move);
        winner = check_MCTS_winner(state);
    }

    return winner;
}

function MCTS_backpropogate(leaf: MCTSNode, winner: number, target = MCTSTarget.Win) {
    let node: MCTSNode | null = leaf;
    const score = leaf.state.player[winner].score;
    // const score = 1;
    while (node !== null)
    {
        if ((node.state.playerID == 1 - winner && target == MCTSTarget.Win) ||
            (node.state.playerID == winner && target == MCTSTarget.Lose))
            node.parentScore += score;
        node.totalPlay++;

        node = node.parent;
    }
}

function MCTS_iterate(root: MCTSNode, UCB1ExploreParam: number, target = MCTSTarget.Win) {
    let leaf = MCTS_select(root, UCB1ExploreParam);
    // console.log("select ", leaf);
    let winner = check_MCTS_winner(leaf.state);
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

function MCTS_get_best_move(root: MCTSNode, policy = MCTSPolicy.MaxPlay) {
    let bestPlay: MCTSMove | null = null;
    let max = -Infinity;
    for (const child of root.children) {
        if (policy == MCTSPolicy.MaxPlay && child.totalPlay > max) {
            bestPlay = child.parentMove;
            max = child.totalPlay;
        } else if (policy == MCTSPolicy.WinRate) {
            const rate = child.parentScore / child.totalPlay;
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

function MCTS_search(iteration: number, UCB1ExploreParam: number, target = MCTSTarget.Win, policy = MCTSPolicy.MaxPlay) {
    const root = new MCTSNode(null, null, get_root_MCTS_state());
    // console.log(root.state);
    while (iteration-- > 0)
        MCTS_iterate(root, UCB1ExploreParam, target);
    // console.log(root);
    return MCTS_get_best_move(root, policy);
}

function test(iteration: number, UCB1ExploreParam: number) {
    const first = randomInt(0, 1);
    const deck:number[] = [];
    const field:number[] = [];
    const plr = new Player(PLR);
    const cpu = new Player(CPU);
    for (let i = 0; i < 48; i++) {
        deck.push(i);
    }
    shuffle_deck(deck);
    for (let i = 0; i < HAND_NUM; i++) {
        const c = deck.pop();
        if (c !== undefined)
            field.push(c);
    }
    for (let i = 0; i < HAND_NUM; i++) {
        const c = deck.pop();
        if (c !== undefined)
            plr.hand.push(c);
    }
    for (let i = 0; i < HAND_NUM; i++) {
        const c = deck.pop();
        if (c !== undefined)
            cpu.hand.push(c);
    }
    let state = new MCTSState(first, deck, field, plr, cpu);
    // console.log(state);

    let winner = check_MCTS_winner(state);
    while (winner == -2) {
        if (state.playerID === CPU) {
            const root = new MCTSNode(null, null, state);
            let i = iteration;
            while (i-- > 0)
                MCTS_iterate(root, UCB1ExploreParam);
            const move = MCTS_get_best_move(root);
            state = get_next_MCTS_state(state, move);
        } else {
            /* random */
            const moves = get_legal_moves(state);
            const move = moves[randomInt(0, moves.length - 1)];
            state = get_next_MCTS_state(state, move);
        }
        // console.log(state);
        winner = check_MCTS_winner(state);
    }
    // console.log(winner);
    return winner;
}

function testAI(times: number, iteration: number, UCB1ExploreParam: number) {
    let win = 0;
    let total = times;
    while (times-- > 0) {
        if (test(iteration, UCB1ExploreParam) == CPU)
            win++;
    }
    return win / total;
}