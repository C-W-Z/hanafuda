# 花札 Hanafuda

網頁版花牌遊戲for橫版頁面

——手機板的直式網頁我還沒設計啦

持續更新中

## Control

`left mouse` : press buttons & play cards

`r` : resize the screen

## Rules

採用[Hanafuda](https://en.wikipedia.org/wiki/Hanafuda)中的[Koi-Koi](https://en.wikipedia.org/wiki/Koi-Koi)玩法，也是最常見的花札玩法。
<br/>

### How to play

見：[花札#規則解說](https://zh.wikipedia.org/wiki/花札#規則解說)

#### 進行流程

首先本遊戲為雙人遊戲，第一局前先抽牌決定「親」（莊家）或「子」（閑家），親先出牌，第二局以後由前一局的勝者當親先出牌。

手牌每人各八張持於手上是不給對方看的，場牌只有八張則是置於桌面翻開的，再決定月札牌（可有可無，切牌決定），每輪到某人，該人就從手牌裏拿出一張，若跟場牌有同月份者，就可吃回一墩（兩張），接下來從山牌抽出一張，也是跟場牌比對，同月份的必須吃回，若跟場牌有不同配對方式，則可自行選擇要吃哪一張場牌。

接下來檢視吃回的牌，若有因本次吃進的牌組成「役」，則可決定是否結束牌局，若決定繼續，則由對方進行上述的程序。


#### 牌局結束

有三種方式：

1. 其中一方喊停（喊停權力如上述）。喊停的一方則可以計算手上所有吃進牌的役，另一方則不能計算役。所以什麼時候喊停也是一個重要的策略。
2. 雙方牌都已出完，但兩方最後一張牌都沒能吃進湊成役。這種結束方式，不管你吃了什麼牌，雙方就不能計算任何役。有些規則裡有「親權」，就是在這種狀況下，莊家直接得6點。
3. 某方的最後一張吃進的牌恰好湊成役，也會強制結束。這時計算役的權力在手上無牌的一方（也就是最後一次的出牌方）。

### Yaku(役) List

以下是這個遊戲中的役，劃刪除線的役不採用

| name | condition | score |
| --- | --- | --- |
| 五光 | <img src="img/0.png" title="松上鶴" height="75px"> <img src="img/8.png" title="櫻上幕簾" height="75px"> <img src="img/28.png" title="芒上月" height="75px"> <img src="img/40.png" title="柳間小野道風" height="75px"> <img src="img/44.png" title="桐上鳳凰" height="75px"> | 10 |
| 四光 | 得到不包含「柳間小野道風」之外其餘4張光牌 | 8 |
| 雨四光 | 得到「柳間小野道風」加上另外3張光牌 | 7 |
| 三光 | 得到不包含「柳間小野道風」之外得到其餘4張光牌裡面的3張 | 5 |
| ~~花見で一杯~~ | <img src="img/8.png" title="櫻上幕簾" height="75px"> <img src="img/32.png" title="菊上盃" height="75px"> | 3 |
| ~~月見で一杯~~ | <img src="img/28.png" title="芒上月" height="75px"> <img src="img/32.png" title="菊上盃" height="75px"> | 3 |
| ~~飲み~~ | <img src="img/8.png" title="櫻上幕簾" height="75px"> <img src="img/28.png" title="芒上月" height="75px"> <img src="img/32.png" title="菊上盃" height="75px"> | 5 |
| 猪鹿蝶 | <img src="img/20.png" title="牡丹蝶" height="75px"> <img src="img/24.png" title="萩間野豬" height="75px"> <img src="img/36.png" title="楓間鹿" height="75px"> | 5 |
| 赤短 | <img src="img/1.png" title="松上赤短" height="75px"> <img src="img/5.png" title="梅上赤短" height="75px"> <img src="img/9.png" title="櫻上赤短" height="75px"> | 5 |
| 青短 | <img src="img/21.png" title="牡丹上青短" height="75px"> <img src="img/33.png" title="菊上青短" height="75px"> <img src="img/37.png" title="楓上青短" height="75px"> | 5 |
| ~~草~~ | <img src="img/13.png" title="藤上短冊" height="75px"> <img src="img/17.png" title="蒲上短冊" height="75px"> <img src="img/25.png" title="萩上短冊" height="75px"> | 5 |
| タネ | 得到5張任意種牌，每多獲得1張種牌結算時分數+1 | 1(+1) |
| 短冊 | 得到5張短冊牌，每多獲得1張短冊牌結算時分數+1 | 1(+1) |
| カス | 得到10張粕(滓)牌，每多獲得1張粕牌結算時分數+1 | 1(+1) |
| ~~月札~~ | 僅用於12月玩法，收集到當月的4張牌 | 4 |
| 親権 | 雙方牌出完卻都沒有湊成役時，「親」得6文 | 6 |
| ~~手四~~ | 一開始時手牌中即持有一個月份中的四張牌 | 6 |
| ~~喰付~~ | 一開始時手牌中即持有四個月各2張牌 | 6 |

## Source

The images in `img` are licensed under the [Creative Commons](https://en.wikipedia.org/wiki/en:Creative_Commons) [Attribution-Share Alike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/deed.en) license (CC BY-SA 4.0) by [Louie Mantia](https://commons.wikimedia.org/wiki/User:Louiemantia), sourced from https://en.wikipedia.org/wiki/Sakura_(card_game).
The images in `img` are licensed under the [Creative Commons](https://en.wikipedia.org/wiki/en:Creative_Commons) [Attribution-Share Alike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/deed.en) license (CC BY-SA 4.0) by [Louie Mantia](https://commons.wikimedia.org/wiki/User:Louiemantia), sourced from https://en.wikipedia.org/wiki/Sakura_(card_game).
