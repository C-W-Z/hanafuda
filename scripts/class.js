/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/hanafuda.git
 */

class Data {
    constructor() {
        const obj = localStorage.getItem('Data');
        if (!obj) {
            this.init();
            this.store();
        } else {
            Object.assign(this, JSON.parse(obj));
        }
    }

    init() {
        this.battleTime = [0,0,0,0,0,0,0,0,0,0,0,0]; // 對戰回數 [1~12月]
        this.totalMonth = 0; // 總對局數
        this.maxTotalMoney = [0,0,0,0,0,0,0,0,0,0,0,0]; // 最高獲得總文數 [1~12月]
        this.maxMoneyMonth = 0; // 最高獲得文數(單月) [PLR, CPU]
        this.totalMoney = 0; // 累計獲得文數 [PLR, CPU]
        // 平均獲得文數 = totalMoney / totalMonth
        this.totalWin = [[0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0]]; // 勝利數 [PLR, CPU][1~12月]
        // 平手數[1/3/6/12月] = battleTime[i] - totalWin[PLR][i] - totalWin[CPU][i];
        // 勝率 = totalWin[PLR][i] / battleTime[i];
        this.totalWinMonth = [0, 0]; // 單月勝利數 [PLR, CPU]
        // 勝率(月) = totalWinMonth[PLR] / totalMonth;
        this.totalLastWin = [0, 0]; // 目前對戰連勝數 (不分幾月玩法) [PLR, CPU]
        this.lastWin = [[0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0]]; // 目前對戰連勝數[PLR, CPU][1~12月]
        this.lastWinMonth = [0, 0]; // 目前單月連勝數 [PLR, CPU]
        this.maxTotalStreak = [0, 0]; // 不分幾月玩法的連勝數 [PLR, CPU]
        this.maxStreak = [[0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0]]; // 最大連勝數 [PLR, CPU][1~12月]
        this.maxStreakMonth = [0, 0]; // 最大連勝月數 [PLR, CPU]
        this.canKoiTime = [0, 0]; // 可以Koi Koi的次數(除了最後一回合之外組成役的次數) [PLR, CPU]
        this.totalKoiTime = [0, 0]; // koikoi總次數 [PLR, CPU]
        this.koiSucessTime = [0, 0]; // koikoi之後又組成役的總次數(包括親權)
        // Koi Koi 率 = totalKoiTime / canKoiTime
        // Koi Koi 成功率 = koiSucessTime / totalKoiTime

        // 組成yaku的次數(不論輸贏)(カス,短冊,タネ一月中最多只算一次) 參考yaku_name
        this.yakuTime = new Array(YAKU_NUM);
        for (let i = 0; i <  this.yakuTime.length; i++)
            this.yakuTime[i] = 0;
        // 出現率 = yakuTime[i] / totalMonth
    }

    store() {
        localStorage.setItem('Data', JSON.stringify(this));
    }
}

class Card {
    constructor(ID) {
        this.ID = ID;
        this.reset_month()
    }

    reset_month() {
        this.px = DECK_P.x;
        this.py = DECK_P.y;
        this.scaleX = 1;
        this.back = true;
        this.noticed = false;
        this.selected = false;
        this.place = cardPlace.deck;
    }

    draw() {
        draw_card((this.back ? CARD_BACK_ID : this.ID),
                   this.px,
                  (this.selected ? this.py - 20 : this.py),
                  (this.back ? false : this.noticed),
                   this.scaleX);
    }

    draw_large() {
        context.drawImage(cardImg[(this.back ? CARD_BACK_ID : this.ID)],
                         (this.px + (1 - this.scaleX) * CARD_LARGE_W / 2) * R,
                          this.py * R,
                          CARD_LARGE_W * this.scaleX * R,
                          CARD_LARGE_H * R);
        if (this.noticed) {
            context.strokeStyle = "gold";
            context.lineWidth = 2 * R;
            context.strokeRect(this.px * R, this.py * R, CARD_LARGE_W * R, CARD_LARGE_H * R);
        }
    }
}

class Player {
    constructor(ID) {
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
        this.yaku = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.selected_handID = -1;
        this.selected_fieldID = 0;
        this.needToThrow = false;
        this.draw_cardID = -1;
        this.koi_time = 0;
    }

    addHand(cardID) {
        card[cardID].back = (this.ID == CPU);
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = (this.ID == PLR) ? cardPlace.player_hand : cardPlace.cpu_hand;
        this.hand.push(cardID);
    }

    removeHand(handID) {
        card[this.hand[handID]].back = false;
        card[this.hand[handID]].noticed = false;
        card[this.hand[handID]].selected = false;
        card[this.hand[handID]].place = cardPlace.moving;
        for (let i = handID; i < this.hand.length - 1; i++)
            this.hand[i] = this.hand[i + 1];
        this.hand.pop();
        this.selected_handID = -1;
    }

    addCollect(cardID) {
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
                else
                    card[this.collect[i][j]].px = (CARD_W+CARD_GAP*2) * (2 * j / this.collect[i].length) + CARD_GAP;
                if (this.ID == PLR) {
                    if (i % 2 == 0)
                        card[this.collect[i][j]].py = SCREEN_H - (CARD_H+CARD_GAP*2) + CARD_GAP;
                    else
                        card[this.collect[i][j]].py = SCREEN_H - 2 * (CARD_H+CARD_GAP*2) + CARD_GAP;
                } else { // ID == CPU
                    if (i % 2 == 0)
                        card[this.collect[i][j]].py = (CARD_H+CARD_GAP*2) + CARD_GAP;
                    else
                        card[this.collect[i][j]].py = CARD_GAP;
                }
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
        const light   = this.collect[3].length;
        const seed    = this.collect[2].length;
        const ribbon  = this.collect[1].length;
        const dross   = this.collect[0].length;

        // see : yaku_name
        let now_yaku = new Array(YAKU_NUM);
        for (let i = 0; i < YAKU_NUM; i++)
            now_yaku[i] = 0;

        let rain = 0; // 雨
        let inoshikacho = 0; // 猪鹿蝶
        let akatan = 0; // 赤短
        let aotan = 0; // 青短
        let getsusatsu = 0; // 月札
        let hanamideippai = 0; // 花見酒
        let tsukimideippai = 0; // 月見酒
        let kusa = 0; // 草短

        for (const arr of this.collect) {
            for (const c of arr) {
                if (c == 40) rain++;
                if (c == 20 || c == 24 || c == 36) inoshikacho++;
                if (c ==  1 || c ==  5 || c ==  9) akatan++;
                if (c == 21 || c == 33 || c == 37) aotan++;
                if (Math.floor(c/4) == game.month-1) getsusatsu++;
				if (c ==  8 || c == 32) hanamideippai++;
				if (c == 28 || c == 32) tsukimideippai++;
				if (c == 13 || c == 17 || c == 25) kusa++;
            }
        }

        yaku_name;
        if (light              == 5 ) now_yaku[ 1] += 1; // 五光
        if (light == 4 && rain == 0 ) now_yaku[ 2] += 1; // 四光
        if (light == 4 && rain == 1 ) now_yaku[ 3] += 1; // 雨四光
        if (light == 3 && rain == 0 ) now_yaku[ 4] += 1; // 三光
        if (game.flower_moon_sake && hanamideippai + tsukimideippai == 4) now_yaku[ 5]++; // 飲み
        if (game.flower_sake      && hanamideippai                  == 2) now_yaku[ 6]++; // 花見で一杯
        if (game.moon_sake        && tsukimideippai                 == 2) now_yaku[ 7]++; // 月見で一杯
        if (inoshikacho        == 3 ) now_yaku[ 8] += 1; // 猪鹿蝶
        if (akatan             == 3 ) now_yaku[ 9] += 1; // 赤短
        if (aotan              == 3 ) now_yaku[10] += 1; // 青短
        if (game.grass            && kusa                           == 3) now_yaku[11]++; // 草
        if (game.month_yaku       && getsusatsu                     == 4) now_yaku[12]++; // 月札
        if (dross              >= 10) now_yaku[13] += dross  - 9; // カス
        if (ribbon             >= 5 ) now_yaku[14] += ribbon - 4; // 短冊
        if (seed               >= 5 ) now_yaku[15] += seed   - 4; // タネ

        this.score = 0;
        let get_new_yaku = false;
        for (let i = 0; i < YAKU_NUM; i++) {
            // check is there new yaku
            if (now_yaku[i] > this.yaku[i])
                get_new_yaku = true;
            // copy now yaku to old yaku
            this.yaku[i] = now_yaku[i];
            // calculate new score
            this.score += yaku_score[i] * now_yaku[i];
        }

        return get_new_yaku;
    }
}

class Field {
    constructor() {
        this.card = new Array(FIELD_SPACE);
        this.reset_month();
    }

    reset_month() {
        for (let i = 0; i < FIELD_SPACE; i++)
            this.card[i] = -1;
    }

    insertCard(fieldID, cardID) {
        card[cardID].back = false;
        card[cardID].noticed = false;
        card[cardID].selected = false;
        card[cardID].place = cardPlace.field;
        this.card[fieldID] = cardID;
    }

    removeCard(fieldID) {
        card[this.card[fieldID]].back = false;
        card[this.card[fieldID]].noticed = false;
        card[this.card[fieldID]].selected = false;
        card[this.card[fieldID]].place = cardPlace.moving;
        movingCard.unshift(this.card[fieldID]); // push_front
        this.card[fieldID] = -1;
        this.update_noticed(-1);
    }

    update_noticed(month) {
        for (let i = 0; i < FIELD_SPACE; i++) {
            if (this.card[i] < 0) continue;
            if (Math.floor(this.card[i] / 4) == month)
                card[this.card[i]].noticed = true;
            else
                card[this.card[i]].noticed = false;
        }
    }

    update_card_info() {
        // this.update_noticed();
        // update px,py
        for (let i = 0; i < FIELD_SPACE; i++) {
            if (this.card[i] < 0) continue;
            card[this.card[i]].px = Field.X(i);
            card[this.card[i]].py = Field.Y(i);
        }
    }

    // i: index in field.card[i]
    static X(i) {
        if (i < FIELD_SPACE / 2)
            return SCREEN_W/2 -CARD_W+CARD_GAP - (CARD_W+CARD_GAP*2) * Math.floor((FIELD_SPACE/2-i+1)/2) + CARD_GAP;
        return SCREEN_W/2 +CARD_W+CARD_GAP + (CARD_W+CARD_GAP*2) * Math.floor((i-FIELD_SPACE/2)/2) + CARD_GAP;
    }
    static Y(i) {
        return SCREEN_H / 2 - (CARD_H+CARD_GAP*2) + (CARD_H+CARD_GAP*2) * (i % 2) + CARD_GAP;
    }
}

class Game {
    constructor(maxMonth = 12) {
        this.state = gameState.title; // 整個網頁現在的狀態(畫面)
        this.MAXMONTH = maxMonth; // 預設12月玩法
        this.month = 0; // 月份
        this.first = 0; // 誰先手
        this.round = 0; // 當前月份現在是第幾回合(start from 0)
        this.koi = -1; // whether player/cpu is doing koi koi
        this.winner = -1; // 贏家

        // rules
        this.month_yaku = true; // 啟用月札
        this.flower_sake = false; // 啟用花見酒
        this.moon_sake = false; // 啟用花見酒
        this.flower_moon_sake = true; // 啟用花月見
        this.grass = false; // 啟用草上短冊
        this.koi_bouns = true; // koikoi bonus (score * koikoi time)

        this.op = false; // look cpu's hand cards
    }

    reset_month() {
        this.state = gameState.start; // 整個網頁現在的狀態(畫面)
        this.round = 0; // 當前月份現在是第幾回合(start from 0)
        this.koi = -1; // whether player/cpu is doing koi koi
        this.winner = -1; // 贏家
    }
}

class Button {
    /**
     * @param {number} px 按鈕左上角x座標
     * @param {number} py 按鈕左上角y座標
     * @param {number} width 按鈕寬度
     * @param {number} height 按鈕高度
     * @param {number} radius 按鈕四角的圓半徑
     * @param {string} text 按鈕上的文字
     * @param {number} fontsize 字體大小
     * @param {Function} func 按下按鈕後會執行的函式
     * @param {string} bordercolor 邊界顏色
     * @param {string} fillcolor 按鈕顏色
     * @param {string} textcolor 文字顏色
     */
    constructor(px, py, width, height, radius, text = '', fontsize = FONT_SIZE, func = null, bordercolor = '', fillcolor = 'black', textcolor = 'white') {
        this.x = px;
        this.y = py;
        this.w = width;
        this.h = height;
        this.r = radius;
        this.text = text;
        this.fontsize = fontsize;
        this.press_func = func;
        this.borderColor = bordercolor;
        this.fillColor = fillcolor;
        this.textColor = textcolor;
        this.vertical = false;
    }

    draw() {
        if (this.fillColor != '') {
            context.fillStyle = this.fillColor;
            context.beginPath();
            context.roundRect(this.x * R, this.y * R, this.w * R, this.h * R, this.r * R);
            context.fill();
        }
        if (this.fontsize > 0 || text != '') {
            context.fillStyle = this.textColor;
            context.font = this.fontsize * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
            if (this.vertical)
                for (let i = 0; i < this.text.length; i++)
                    context.fillText(this.text[i], (this.x + this.w/2) * R, (this.y + this.h/2 + (i + 0.5 - this.text.length/2) * this.fontsize) * R);
            else
                context.fillText(this.text, (this.x + this.w/2) * R, (this.y + this.h/2) * R);
        }
        if (this.borderColor != '') {
            context.lineWidth = 3 * R;
            context.strokeStyle = this.borderColor;
            context.roundRect(this.x * R, this.y * R, this.w * R, this.h * R, this.r * R);
            context.stroke();
        }
    }

    /**
     * @abstract 檢查滑鼠座標是否在此按鈕內
     * @param {{x,y}} mouse 滑鼠座標
     * @returns {bool} true or false
     */
    include(mouse) {
        return (mouse.x > this.x && mouse.x < this.x + this.w &&
                mouse.y > this.y && mouse.y < this.y + this.h)
    }

    // 在click_func裡呼叫這個函式
    // 檢查是否被按下並執行
    check_press() {
        if (this.include(mouse) && this.press_func != null)
            this.press_func();
    }
}