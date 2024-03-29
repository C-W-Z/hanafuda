# 花札 Hanafuda

網頁版花牌遊戲for橫版頁面

——手機板的直式網頁我還沒設計啦

Last Update: 2024/2/4

> :warning: Warning
> 
> If you has open the website before my last update time, please **Clear Site Data** of it or use **Hard Refresh** (e.g. `Ctrl+F5` in Chrome).

## Control

`left mouse` : press buttons & play cards

`r` : resize the screen

`esc` : back to title (invalid in game)

`left arrow` : previous page

`right arrow` : next page

## How to Play

採用[Hanafuda](https://en.wikipedia.org/wiki/Hanafuda)中的[Koi-Koi](https://en.wikipedia.org/wiki/Koi-Koi)(來來)玩法。

參考：[花札](https://zh.wikipedia.org/wiki/花札)

本遊戲為雙人遊戲，一次對戰可以有1/3/6/12局（月），最終累計得分（文）高者獲勝。

#### 進行流程

第一局（月）前先抽牌決定第一局的「親」（莊家），親先出牌，第二局以後由前一局的贏家當親先出牌。

每一局（月）開始時發牌，每人8張手牌，8張場牌。

每輪到某方的回合時，那一方就從手牌中拿出一張，若跟場牌有同月份者，就可吃回1張同月份場牌與那張手牌（稱為「合札」），否則該手牌變成場牌，接下來從山牌（牌堆）中抽出一張，也是跟場牌比對，同月份的必須吃回，若跟場牌有不同配對方式，則可自行選擇要吃哪一張場牌，否則也是作為場牌。

接下來檢視吃回的牌，若有因本次吃進的牌組成「役」（Yaku），則可決定是否結束牌局，若決定繼續（こいこい Koi Koi）或者沒有因本次吃進的牌組成役，則進入對方的回合。

#### 牌局結束

有三種方式：

1. 其中一方喊停（喊停權力如上述）。喊停的一方則可以計算手上所有吃進牌的役，另一方則不能計算役（即沒有分數）。所以什麼時候喊停也是一個重要的策略。
2. 雙方牌都已出完，但兩方都沒能湊成任何役。在這種狀況下，莊家獲得6文（分），即「親權」。
3. 某方最後一張吃進的牌恰好湊成役(此時該方手牌為空)，牌局會強制結束，且該方獲得計算役的權力，另一方不能計算役。

### Card List

| 月份<br>Month | 植物（花）<br>Pattern(Suit) | 光<br>Light | 種<br>タネ<br>Seed | 短冊<br>Ribbon | 粕（滓）<br>カス<br>Dross |
| --- | --- | --- | --- | --- | --- |
| 1月<br>睦月 | 松樹 | <img src="imgs/0.webp" title="松上鶴" height="75px"> | | <img src="imgs/1.webp" title="松上赤短" height="75px"> | <img src="imgs/2.webp" title="松" height="75px"> <img src="imgs/3.webp" title="松" height="75px"> |
| 2月<br>如月 | 梅花 | | <img src="imgs/4.webp" title="梅上鶯" height="75px"> | <img src="imgs/5.webp" title="梅上赤短" height="75px"> | <img src="imgs/6.webp" title="梅" height="75px"> <img src="imgs/6.webp" title="梅" height="75px"> |
| 3月<br>彌生 | 櫻花 | <img src="imgs/8.webp" title="櫻上幕簾" height="75px"> | | <img src="imgs/9.webp" title="櫻上赤短" height="75px"> | <img src="imgs/10.webp" title="櫻" height="75px"> <img src="imgs/11.webp" title="櫻" height="75px"> |
| 4月<br>卯月 | 紫藤 | | <img src="imgs/12.webp" title="藤上杜鵑" height="75px"> | <img src="imgs/13.webp" title="藤上短冊" height="75px"> | <img src="imgs/14.webp" title="藤" height="75px"> <img src="imgs/15.webp" title="藤" height="75px"> |
| 5月<br>皐月 | 菖蒲 | | <img src="imgs/16.webp" title="蒲間八橋" height="75px"> | <img src="imgs/17.webp" title="蒲上短冊" height="75px"> | <img src="imgs/18.webp" title="菖蒲" height="75px"> <img src="imgs/19.webp" title="菖蒲" height="75px"> |
| 6月<br>水無月 | 牡丹 | | <img src="imgs/20.webp" title="牡丹蝴蝶" height="75px"> | <img src="imgs/21.webp" title="牡丹青短" height="75px"> | <img src="imgs/22.webp" title="牡丹" height="75px"> <img src="imgs/23.webp" title="牡丹" height="75px"> |
| 7月<br>文月 | 萩 | | <img src="imgs/24.webp" title="萩間野豬" height="75px"> | <img src="imgs/25.webp" title="萩上短冊" height="75px"> | <img src="imgs/26.webp" title="萩" height="75px"> <img src="imgs/27.webp" title="萩" height="75px"> |
| 8月<br>葉月 | 芒草 | <img src="imgs/28.webp" title="芒上月" height="75px"> | <img src="imgs/29.webp" title="芒上雁" height="75px"> | | <img src="imgs/30.webp" title="芒" height="75px"> <img src="imgs/31.webp" title="芒" height="75px"> |
| 9月<br>長月 | 菊花 | | <img src="imgs/32.webp" title="菊上盃" height="75px"> | <img src="imgs/33.webp" title="菊上青短" height="75px"> | <img src="imgs/34.webp" title="菊" height="75px"> <img src="imgs/35.webp" title="菊" height="75px"> |
| 10月<br>神無月 | 楓葉<br>紅葉 | | <img src="imgs/36.webp" title="楓間鹿" height="75px"> | <img src="imgs/37.webp" title="楓上青短" height="75px"> | <img src="imgs/38.webp" title="楓葉" height="75px"> <img src="imgs/39.webp" title="楓葉" height="75px"> |
| 11月<br>霜月 | 柳樹（雨） | <img src="imgs/40.webp" title="柳間小野道風" height="75px"> | <img src="imgs/41.webp" title="柳上燕" height="75px"> | <img src="imgs/42.webp" title="柳上短冊" height="75px"> | <img src="imgs/43.webp" title="柳雷雨鼓" height="75px"> |
| 12月<br>師走 | 泡桐 | <img src="imgs/44.webp" title="桐上鳳凰" height="75px"> | | | <img src="imgs/45.webp" title="桐" height="75px"> <img src="imgs/46.webp" title="桐" height="75px"> <img src="imgs/47.webp" title="桐" height="75px"> |

### Yaku（役） List

以下是這個遊戲中的役，劃刪除線的役不採用。

| name | condition | score |
| --- | --- | --- |
| 五光 | <img src="imgs/0.webp" title="松上鶴" height="75px"> <img src="imgs/8.webp" title="櫻上幕簾" height="75px"> <img src="imgs/28.webp" title="芒上月" height="75px"> <img src="imgs/40.webp" title="柳間小野道風" height="75px"> <img src="imgs/44.webp" title="桐上鳳凰" height="75px"> | 10/15 |
| 四光 | 得到不包含「柳間小野道風」之外其餘4張光牌 | 8/10 |
| 雨四光 | 得到「柳間小野道風」加上另外3張光牌 | 7/8 |
| 三光 | 得到不包含「柳間小野道風」之外得到其餘4張光牌裡面的3張 | 5/6 |
| 松桐坊主 | <img src="imgs/0.webp" title="松上鶴" height="75px"> <img src="imgs/28.webp" title="芒上月" height="75px"> <img src="imgs/44.webp" title="桐上鳳凰" height="75px"> | 5 |
| 表菅原<br>梅松桜<br>大三（おおざん） | <img src="imgs/0.webp" title="松上鶴" height="75px"> <img src="imgs/4.webp" title="梅上鶯" height="75px"> <img src="imgs/8.webp" title="櫻上幕簾" height="75px"> | 5 |
| 飲み（鉄砲）<br>花月見<br>月花酒 | <img src="imgs/8.webp" title="櫻上幕簾" height="75px"> <img src="imgs/28.webp" title="芒上月" height="75px"> <img src="imgs/32.webp" title="菊上盃" height="75px"> | 3/5/6 |
| 花見で一杯 | <img src="imgs/8.webp" title="櫻上幕簾" height="75px"> <img src="imgs/32.webp" title="菊上盃" height="75px"> | 2/3/5 |
| 月見で一杯 | <img src="imgs/28.webp" title="芒上月" height="75px"> <img src="imgs/32.webp" title="菊上盃" height="75px"> | 2/3/5 |
| 猪鹿蝶 | <img src="imgs/20.webp" title="牡丹蝶" height="75px"> <img src="imgs/24.webp" title="萩間野豬" height="75px"> <img src="imgs/36.webp" title="楓間鹿" height="75px"> | 5 |
| 五鳥（ごとり） | <img src="imgs/4.webp" title="梅上鶯" height="75px"> <img src="imgs/12.webp" title="藤上杜鵑" height="75px"> <img src="imgs/29.webp" title="芒上雁" height="75px"> | 5 |
| 七短 | 得到除「柳上短冊」以外的短冊7張 | 7 |
| 六短 | 得到除「柳上短冊」以外的短冊6張 | 5 |
| 赤短・青短<br>ぶっく | <img src="imgs/1.webp" title="松上赤短" height="75px"> <img src="imgs/5.webp" title="梅上赤短" height="75px"> <img src="imgs/9.webp" title="櫻上赤短" height="75px"> <img src="imgs/21.webp" title="牡丹上青短" height="75px"> <img src="imgs/33.webp" title="菊上青短" height="75px"> <img src="imgs/37.webp" title="楓上青短" height="75px"> | 4/10/15 |
| 赤短 | <img src="imgs/1.webp" title="松上赤短" height="75px"> <img src="imgs/5.webp" title="梅上赤短" height="75px"> <img src="imgs/9.webp" title="櫻上赤短" height="75px"> | 5/6 |
| 青短 | <img src="imgs/21.webp" title="牡丹上青短" height="75px"> <img src="imgs/33.webp" title="菊上青短" height="75px"> <img src="imgs/37.webp" title="楓上青短" height="75px"> | 5/6 |
| 草<br>草短 | <img src="imgs/13.webp" title="藤上短冊" height="75px"> <img src="imgs/17.webp" title="蒲上短冊" height="75px"> <img src="imgs/25.webp" title="萩上短冊" height="75px"> | 3/5 |
| タネ | 得到5張任意種牌，每多獲得1張種牌結算時分數+1 | 1（+1） |
| 短冊（たん） | 得到5張短冊牌，每多獲得1張短冊牌結算時分數+1 | 1（+1） |
| カス | 得到10張粕（滓）牌，每多獲得1張粕牌結算時分數+1 | 1（+1） |
| 月札 | 收集到當月的4張牌 | 4 |
| 親権 | 雙方牌出完卻都沒有湊成役時，「親」得6文 | 6 |
| ~~手四~~ | 一開始時手牌中即持有一個月份中的四張牌 | 6 |
| ~~喰付~~ | 一開始時手牌中即持有四個月各2張牌 | 6 |

### Special Rules

花札有許多特殊規則，可自行決定要不要採用：

+ 親子輪換：第二局以後雙方輪流當親先出牌
+ 7文以上加倍：每月結算時，如果贏家有獲得7文或以上，則獲得文數x2
+ こいこい加倍：任一方喊出こいこい時，最終結算文數提升1倍
+ 雨流：一方獲得「柳間小野道風」時，該玩家無法成立花見酒、月見酒
+ 霧流：一方獲得「桐上鳳凰」時，該玩家無法成立花見酒、月見酒
+ 獲得花見酒、月見酒時無法こいこい或結束
+ 飲み和花見酒、月見酒分數可同時計算
+ 光牌分數可累計
+ 七短/六短分數和短冊可同時計算
+ 赤短・青短の重複役與赤短、青短的分數可同時計算
+ 「菊上盃」可以當作粕（滓）牌來計算カス
+ 2文以下無法こいこい或結束

+ 牌差調整：防止雙方獲得牌數相差過大；為了平衡，預設開啟。

## Sources

The font `Yuji Syuku` is is licensed under the SIL Open Font License, Version 1.1., sourced from https://github.com/Kinutafontfactory/Yuji.

The images in `imgs` are licensed under the [Creative Commons](https://en.wikipedia.org/wiki/en:Creative_Commons) [Attribution-Share Alike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/deed.en) license （CC BY-SA 4.0） by [Louie Mantia](https://commons.wikimedia.org/wiki/User:Louiemantia), sourced from https://en.wikipedia.org/wiki/Sakura_(card_game).