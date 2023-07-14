/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/hanafuda.git
 * @copyright © 2023 C-W-Z
 */

class Data {
    constructor() {
        this.init();
        const obj = JSON.parse(localStorage.getItem('Data'));
        if (obj && equalObjFormat(this, obj))
            Object.assign(this, obj);
        else
            this.store();
    }

    init() {
        this.battleTime = 0; // 対戦回数
        this.battleMonth = 0; // 総月数
        this.totalMoney = [0,0]; // 累計獲得文數 [PLR, CPU]
        this.maxTotalMoney = [0,0]; // 最高獲得総文数 [PLR, CPU]
        this.maxMoneyMonth = [0,0]; // 月最高獲得文数 [PLR, CPU]
        // 月平均獲得文数 = totalMoney / battleMonth
        this.totalWin = [0,0]; // 勝利數 [PLR, CPU]
        // 平手數 = battleTime - totalWin[PLR] - totalWin[CPU];
        // 勝率 = totalWin[PLR] / battleTime;
        this.winMonth = [0,0]; // 月勝利數 [PLR, CPU]
        // 勝率(月) = winMonth[PLR] / battleMonth;
        this.totalLastWin = [0,0]; // 目前連勝數 [PLR, CPU]
        this.lastWinMonth = [0,0]; // 目前連勝月數 [PLR, CPU]
        this.totalMaxStreak = [0,0]; // 最大連勝數 [PLR, CPU]
        this.maxStreakMonth = [0,0]; // 最大連勝月數 [PLR, CPU]
        this.canKoiTime = [0,0]; // 可以Koi Koi的次數(除了最後一回合之外組成役的次數) [PLR, CPU]
        this.totalKoiTime = [0,0]; // koikoi總次數 [PLR, CPU]
        this.koiSucessTime = [0,0]; // koikoi之後又組成役的總次數(包括親權) [PLR, CPU]
        // Koi Koi 率 = totalKoiTime / canKoiTime
        // Koi Koi 成功率 = koiSucessTime[PLR] / totalKoiTime[PLR]
        // Koi Koi 阻止率 = 1 - koiSucessTime[CPU] / totalKoiTime[CPU]
        this.sevenUpTime = [0,0]; // 原始分7文以上月數 [PLR, CPU]

        // 組成yaku的次數(不論輸贏)(カス,短冊,タネ一月中最多只算一次) 參考yaku_name
        this.yakuTime = new Array(2); // [PLR, CPU]
        this.yakuTime[PLR] = new Array(YAKU_NUM);
        this.yakuTime[CPU] = new Array(YAKU_NUM);
        for (let i = 0; i <  YAKU_NUM; i++)
            this.yakuTime[PLR][i] = this.yakuTime[CPU][i] = 0;
        // 出現率 = yakuTime[i] / battleMonth

        // rules
        this.adjust_deck = true;
        this.yaku_score = [6, 10, 8, 7, 5, 5, 5, 5, 3, 3, 5, 5, 7, 5, 10, 5, 5, 5., 4, 1, 1, 1];
        this.cpuLevel = 1; // AI策略等級 (0:隨機出牌,1:會根據牌的類型判斷價值,2:會判斷能組成役的特定牌更有價值,3:根據當前情況判斷目標是組成什麼役)
        this.MAXMONTH = 12; // 預設12月玩法 1/3/6/12ヶ月
        this.month_yaku = true; // 啟用月札 有効/無効
        this.first_change = false; // 親 雙方親輪流當親(順番)，否則贏家當下月親(勝者)
        this.first_priority = true; // 啟用親權
        this.koi_bonus = true; // こいこい加倍 (score * koikoi time)
        this.seven_bonus = false; // 7点倍
        this.flower_sake = true; // 啟用花見酒
        this.moon_sake = true; // 啟用月見酒
        this.flower_moon_sake = false; // 啟用花月見
        this.rain_rule = false; // 啟用雨流：有柳間小野道風的玩家無法成立花見酒、花見酒、飲(花月見)
        this.fog_rule = false; // 啟用霧流：有桐上鳳凰的玩家無法成立花見酒、花見酒、飲(花月見)
        this.flower_moon_sake_accumulate = false; // 累計花見酒+月見酒+飲分數
        this.flower_moon_sake_bonus = false; // 花見酒、月見酒可以koikoi和結束，false代表不行(としてBonus)
        this.light_accumulate = false; // 累計光牌的役分數
        this.matsukiribozu = false; // 啟用松桐坊主
        this.sugawara = false; // 啟用表菅原
        this.inoshikacho = true; // 啟用豬鹿蝶
        this.five_bird = false; // 啟用五鳥
        this.grass = false; // 啟用草短
        this.kiku_dross = false; // 菊上盃可以當作粕（滓）牌來計算カス
        this.akatan_aotan = false; // 啟用赤短・青短(ぶっく)
        this.akatan = true; // 啟用赤短
        this.aotan = true; // 啟用青短
        this.akatan_aotan_accumulate = false; // 累計赤短・青短+赤短+青短分數
        this.seven_tan = false; // 啟用七短
        this.six_tan = false; // 啟用六短
        this.tan_accumulate = false; // 累計七短+六短+短冊分數
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
            context.strokeStyle = noticeColor;
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
        this.has = new Array(CARD_NUM);
        for (let i = 0; i < CARD_NUM; i++)
            this.has[i] = 0;
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
        this.has[cardID] = 1;
        update_card_val(cardID);
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

    getNewColloectX(i) {
        if (i < this.collect.length / 2)
            return SCREEN_W - (CARD_W+CARD_GAP*2) - (CARD_W+CARD_GAP*2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
        return (CARD_W+CARD_GAP*2) * (2 * this.collect[i].length / (this.collect[i].length + 1)) + CARD_GAP;
    }

    getNewColloectY(i) {
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
    constructor() {
        this.state = gameState.title; // 整個網頁現在的狀態(畫面)
        this.month = 0; // 月份
        this.first = 0; // 誰先手
        this.round = 0; // 當前月份現在是第幾回合(start from 0)
        this.koi = -1; // whether player/cpu is doing koi koi
        this.winner = -1; // 贏家

        this.op = false; // look cpu's hand cards
    }

    reset_month() {
        this.state = gameState.start; // 整個網頁現在的狀態(畫面)
        this.round = 0; // 當前月份現在是第幾回合(start from 0)
        this.koi = -1; // whether player/cpu is doing koi koi
        this.winner = -1; // 贏家
    }
    
    reset_game() {
        this.month = 0; // 月份
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
            context.font = this.fontsize * R + "px 'Yuji Syuku', sans-serif";
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