let _ = undefined;
const cOBJ = {};

const operatorChars = ['+', '-', '/', '*', '%', '>', '<', '&', '|', '^', '=', '?', ':', '~'].map(x => x.charCodeAt(0));
const operatorWords = ['instanceof', 'delete', 'typeof', 'void', 'in'];

const doEvalCheck = (expr, direction = -1) => {
    try {
        let a = 0, b = 0;
        switch (direction) {
            case -1:
                eval(`{a${expr}}`);
                break;
            case 0:
                eval(`{a${expr}b}`);
                break;
            case 1:
                eval(`{${expr}b}`);
        }

    } catch (e) {
        return false;
    }
    return true;
};

// const setConsole = () => {
//     function flat(data) {
//         return data.reduce((r, e) => Array.isArray(e) ? r = r.concat(flat(e)) : r.push(e) && r, [])
//     }
//
//     const css = "text-shadow: -1px -1px hsl(0,100%,50%), 1px 1px hsl(5.4, 100%, 50%), 3px 2px hsl(10.8, 100%, 50%), 5px 3px hsl(16.2, 100%, 50%), 7px 4px hsl(21.6, 100%, 50%), 9px 5px hsl(27, 100%, 50%), 11px 6px hsl(32.4, 100%, 50%), 13px 7px hsl(37.8, 100%, 50%), 14px 8px hsl(43.2, 100%, 50%), 16px 9px hsl(48.6, 100%, 50%), 18px 10px hsl(54, 100%, 50%), 20px 11px hsl(59.4, 100%, 50%), 22px 12px hsl(64.8, 100%, 50%), 23px 13px hsl(70.2, 100%, 50%), 25px 14px hsl(75.6, 100%, 50%), 27px 15px hsl(81, 100%, 50%), 28px 16px hsl(86.4, 100%, 50%), 30px 17px hsl(91.8, 100%, 50%), 32px 18px hsl(97.2, 100%, 50%), 33px 19px hsl(102.6, 100%, 50%), 35px 20px hsl(108, 100%, 50%), 36px 21px hsl(113.4, 100%, 50%), 38px 22px hsl(118.8, 100%, 50%), 39px 23px hsl(124.2, 100%, 50%), 41px 24px hsl(129.6, 100%, 50%), 42px 25px hsl(135, 100%, 50%), 43px 26px hsl(140.4, 100%, 50%), 45px 27px hsl(145.8, 100%, 50%), 46px 28px hsl(151.2, 100%, 50%), 47px 29px hsl(156.6, 100%, 50%), 48px 30px hsl(162, 100%, 50%), 49px 31px hsl(167.4, 100%, 50%), 50px 32px hsl(172.8, 100%, 50%), 51px 33px hsl(178.2, 100%, 50%), 52px 34px hsl(183.6, 100%, 50%), 53px 35px hsl(189, 100%, 50%), 54px 36px hsl(194.4, 100%, 50%), 55px 37px hsl(199.8, 100%, 50%), 55px 38px hsl(205.2, 100%, 50%), 56px 39px hsl(210.6, 100%, 50%), 57px 40px hsl(216, 100%, 50%), 57px 41px hsl(221.4, 100%, 50%), 58px 42px hsl(226.8, 100%, 50%), 58px 43px hsl(232.2, 100%, 50%), 58px 44px hsl(237.6, 100%, 50%), 59px 45px hsl(243, 100%, 50%), 59px 46px hsl(248.4, 100%, 50%), 59px 47px hsl(253.8, 100%, 50%), 59px 48px hsl(259.2, 100%, 50%), 59px 49px hsl(264.6, 100%, 50%), 60px 50px hsl(270, 100%, 50%), 59px 51px hsl(275.4, 100%, 50%), 59px 52px hsl(280.8, 100%, 50%), 59px 53px hsl(286.2, 100%, 50%), 59px 54px hsl(291.6, 100%, 50%), 59px 55px hsl(297, 100%, 50%), 58px 56px hsl(302.4, 100%, 50%), 58px 57px hsl(307.8, 100%, 50%), 58px 58px hsl(313.2, 100%, 50%), 57px 59px hsl(318.6, 100%, 50%), 57px 60px hsl(324, 100%, 50%), 56px 61px hsl(329.4, 100%, 50%), 55px 62px hsl(334.8, 100%, 50%), 55px 63px hsl(340.2, 100%, 50%), 54px 64px hsl(345.6, 100%, 50%), 53px 65px hsl(351, 100%, 50%), 52px 66px hsl(356.4, 100%, 50%), 51px 67px hsl(361.8, 100%, 50%), 50px 68px hsl(367.2, 100%, 50%), 49px 69px hsl(372.6, 100%, 50%), 48px 70px hsl(378, 100%, 50%), 47px 71px hsl(383.4, 100%, 50%), 46px 72px hsl(388.8, 100%, 50%), 45px 73px hsl(394.2, 100%, 50%), 43px 74px hsl(399.6, 100%, 50%), 42px 75px hsl(405, 100%, 50%), 41px 76px hsl(410.4, 100%, 50%), 39px 77px hsl(415.8, 100%, 50%), 38px 78px hsl(421.2, 100%, 50%), 36px 79px hsl(426.6, 100%, 50%), 35px 80px hsl(432, 100%, 50%), 33px 81px hsl(437.4, 100%, 50%), 32px 82px hsl(442.8, 100%, 50%), 30px 83px hsl(448.2, 100%, 50%), 28px 84px hsl(453.6, 100%, 50%), 27px 85px hsl(459, 100%, 50%), 25px 86px hsl(464.4, 100%, 50%), 23px 87px hsl(469.8, 100%, 50%), 22px 88px hsl(475.2, 100%, 50%), 20px 89px hsl(480.6, 100%, 50%), 18px 90px hsl(486, 100%, 50%), 16px 91px hsl(491.4, 100%, 50%), 14px 92px hsl(496.8, 100%, 50%), 13px 93px hsl(502.2, 100%, 50%), 11px 94px hsl(507.6, 100%, 50%), 9px 95px hsl(513, 100%, 50%), 7px 96px hsl(518.4, 100%, 50%), 5px 97px hsl(523.8, 100%, 50%), 3px 98px hsl(529.2, 100%, 50%), 1px 99px hsl(534.6, 100%, 50%), 7px 100px hsl(540, 100%, 50%), -1px 101px hsl(545.4, 100%, 50%), -3px 102px hsl(550.8, 100%, 50%), -5px 103px hsl(556.2, 100%, 50%), -7px 104px hsl(561.6, 100%, 50%), -9px 105px hsl(567, 100%, 50%), -11px 106px hsl(572.4, 100%, 50%), -13px 107px hsl(577.8, 100%, 50%), -14px 108px hsl(583.2, 100%, 50%), -16px 109px hsl(588.6, 100%, 50%), -18px 110px hsl(594, 100%, 50%), -20px 111px hsl(599.4, 100%, 50%), -22px 112px hsl(604.8, 100%, 50%), -23px 113px hsl(610.2, 100%, 50%), -25px 114px hsl(615.6, 100%, 50%), -27px 115px hsl(621, 100%, 50%), -28px 116px hsl(626.4, 100%, 50%), -30px 117px hsl(631.8, 100%, 50%), -32px 118px hsl(637.2, 100%, 50%), -33px 119px hsl(642.6, 100%, 50%), -35px 120px hsl(648, 100%, 50%), -36px 121px hsl(653.4, 100%, 50%), -38px 122px hsl(658.8, 100%, 50%), -39px 123px hsl(664.2, 100%, 50%), -41px 124px hsl(669.6, 100%, 50%), -42px 125px hsl(675, 100%, 50%), -43px 126px hsl(680.4, 100%, 50%), -45px 127px hsl(685.8, 100%, 50%), -46px 128px hsl(691.2, 100%, 50%), -47px 129px hsl(696.6, 100%, 50%), -48px 130px hsl(702, 100%, 50%), -49px 131px hsl(707.4, 100%, 50%), -50px 132px hsl(712.8, 100%, 50%), -51px 133px hsl(718.2, 100%, 50%), -52px 134px hsl(723.6, 100%, 50%), -53px 135px hsl(729, 100%, 50%), -54px 136px hsl(734.4, 100%, 50%), -55px 137px hsl(739.8, 100%, 50%), -55px 138px hsl(745.2, 100%, 50%), -56px 139px hsl(750.6, 100%, 50%), -57px 140px hsl(756, 100%, 50%), -57px 141px hsl(761.4, 100%, 50%), -58px 142px hsl(766.8, 100%, 50%), -58px 143px hsl(772.2, 100%, 50%), -58px 144px hsl(777.6, 100%, 50%), -59px 145px hsl(783, 100%, 50%), -59px 146px hsl(788.4, 100%, 50%), -59px 147px hsl(793.8, 100%, 50%), -59px 148px hsl(799.2, 100%, 50%), -59px 149px hsl(804.6, 100%, 50%), -60px 150px hsl(810, 100%, 50%), -59px 151px hsl(815.4, 100%, 50%), -59px 152px hsl(820.8, 100%, 50%), -59px 153px hsl(826.2, 100%, 50%), -59px 154px hsl(831.6, 100%, 50%), -59px 155px hsl(837, 100%, 50%), -58px 156px hsl(842.4, 100%, 50%), -58px 157px hsl(847.8, 100%, 50%), -58px 158px hsl(853.2, 100%, 50%), -57px 159px hsl(858.6, 100%, 50%), -57px 160px hsl(864, 100%, 50%), -56px 161px hsl(869.4, 100%, 50%), -55px 162px hsl(874.8, 100%, 50%), -55px 163px hsl(880.2, 100%, 50%), -54px 164px hsl(885.6, 100%, 50%), -53px 165px hsl(891, 100%, 50%), -52px 166px hsl(896.4, 100%, 50%), -51px 167px hsl(901.8, 100%, 50%), -50px 168px hsl(907.2, 100%, 50%), -49px 169px hsl(912.6, 100%, 50%), -48px 170px hsl(918, 100%, 50%), -47px 171px hsl(923.4, 100%, 50%), -46px 172px hsl(928.8, 100%, 50%), -45px 173px hsl(934.2, 100%, 50%), -43px 174px hsl(939.6, 100%, 50%), -42px 175px hsl(945, 100%, 50%), -41px 176px hsl(950.4, 100%, 50%), -39px 177px hsl(955.8, 100%, 50%), -38px 178px hsl(961.2, 100%, 50%), -36px 179px hsl(966.6, 100%, 50%), -35px 180px hsl(972, 100%, 50%), -33px 181px hsl(977.4, 100%, 50%), -32px 182px hsl(982.8, 100%, 50%), -30px 183px hsl(988.2, 100%, 50%), -28px 184px hsl(993.6, 100%, 50%), -27px 185px hsl(999, 100%, 50%), -25px 186px hsl(1004.4, 100%, 50%), -23px 187px hsl(1009.8, 100%, 50%), -22px 188px hsl(1015.2, 100%, 50%), -20px 189px hsl(1020.6, 100%, 50%), -18px 190px hsl(1026, 100%, 50%), -16px 191px hsl(1031.4, 100%, 50%), -14px 192px hsl(1036.8, 100%, 50%), -13px 193px hsl(1042.2, 100%, 50%), -11px 194px hsl(1047.6, 100%, 50%), -9px 195px hsl(1053, 100%, 50%), -7px 196px hsl(1058.4, 100%, 50%), -5px 197px hsl(1063.8, 100%, 50%), -3px 198px hsl(1069.2, 100%, 50%), -1px 199px hsl(1074.6, 100%, 50%), -1px 200px hsl(1080, 100%, 50%), 1px 201px hsl(1085.4, 100%, 50%), 3px 202px hsl(1090.8, 100%, 50%), 5px 203px hsl(1096.2, 100%, 50%), 7px 204px hsl(1101.6, 100%, 50%), 9px 205px hsl(1107, 100%, 50%), 11px 206px hsl(1112.4, 100%, 50%), 13px 207px hsl(1117.8, 100%, 50%), 14px 208px hsl(1123.2, 100%, 50%), 16px 209px hsl(1128.6, 100%, 50%), 18px 210px hsl(1134, 100%, 50%), 20px 211px hsl(1139.4, 100%, 50%), 22px 212px hsl(1144.8, 100%, 50%), 23px 213px hsl(1150.2, 100%, 50%), 25px 214px hsl(1155.6, 100%, 50%), 27px 215px hsl(1161, 100%, 50%), 28px 216px hsl(1166.4, 100%, 50%), 30px 217px hsl(1171.8, 100%, 50%), 32px 218px hsl(1177.2, 100%, 50%), 33px 219px hsl(1182.6, 100%, 50%), 35px 220px hsl(1188, 100%, 50%), 36px 221px hsl(1193.4, 100%, 50%), 38px 222px hsl(1198.8, 100%, 50%), 39px 223px hsl(1204.2, 100%, 50%), 41px 224px hsl(1209.6, 100%, 50%), 42px 225px hsl(1215, 100%, 50%), 43px 226px hsl(1220.4, 100%, 50%), 45px 227px hsl(1225.8, 100%, 50%), 46px 228px hsl(1231.2, 100%, 50%), 47px 229px hsl(1236.6, 100%, 50%), 48px 230px hsl(1242, 100%, 50%), 49px 231px hsl(1247.4, 100%, 50%), 50px 232px hsl(1252.8, 100%, 50%), 51px 233px hsl(1258.2, 100%, 50%), 52px 234px hsl(1263.6, 100%, 50%), 53px 235px hsl(1269, 100%, 50%), 54px 236px hsl(1274.4, 100%, 50%), 55px 237px hsl(1279.8, 100%, 50%), 55px 238px hsl(1285.2, 100%, 50%), 56px 239px hsl(1290.6, 100%, 50%), 57px 240px hsl(1296, 100%, 50%), 57px 241px hsl(1301.4, 100%, 50%), 58px 242px hsl(1306.8, 100%, 50%), 58px 243px hsl(1312.2, 100%, 50%), 58px 244px hsl(1317.6, 100%, 50%), 59px 245px hsl(1323, 100%, 50%), 59px 246px hsl(1328.4, 100%, 50%), 59px 247px hsl(1333.8, 100%, 50%), 59px 248px hsl(1339.2, 100%, 50%), 59px 249px hsl(1344.6, 100%, 50%), 60px 250px hsl(1350, 100%, 50%), 59px 251px hsl(1355.4, 100%, 50%), 59px 252px hsl(1360.8, 100%, 50%), 59px 253px hsl(1366.2, 100%, 50%), 59px 254px hsl(1371.6, 100%, 50%), 59px 255px hsl(1377, 100%, 50%), 58px 256px hsl(1382.4, 100%, 50%), 58px 257px hsl(1387.8, 100%, 50%), 58px 258px hsl(1393.2, 100%, 50%), 57px 259px hsl(1398.6, 100%, 50%), 57px 260px hsl(1404, 100%, 50%), 56px 261px hsl(1409.4, 100%, 50%), 55px 262px hsl(1414.8, 100%, 50%), 55px 263px hsl(1420.2, 100%, 50%), 54px 264px hsl(1425.6, 100%, 50%), 53px 265px hsl(1431, 100%, 50%), 52px 266px hsl(1436.4, 100%, 50%), 51px 267px hsl(1441.8, 100%, 50%), 50px 268px hsl(1447.2, 100%, 50%), 49px 269px hsl(1452.6, 100%, 50%), 48px 270px hsl(1458, 100%, 50%), 47px 271px hsl(1463.4, 100%, 50%), 46px 272px hsl(1468.8, 100%, 50%), 45px 273px hsl(1474.2, 100%, 50%), 43px 274px hsl(1479.6, 100%, 50%), 42px 275px hsl(1485, 100%, 50%), 41px 276px hsl(1490.4, 100%, 50%), 39px 277px hsl(1495.8, 100%, 50%), 38px 278px hsl(1501.2, 100%, 50%), 36px 279px hsl(1506.6, 100%, 50%), 35px 280px hsl(1512, 100%, 50%), 33px 281px hsl(1517.4, 100%, 50%), 32px 282px hsl(1522.8, 100%, 50%), 30px 283px hsl(1528.2, 100%, 50%), 28px 284px hsl(1533.6, 100%, 50%), 27px 285px hsl(1539, 100%, 50%), 25px 286px hsl(1544.4, 100%, 50%), 23px 287px hsl(1549.8, 100%, 50%), 22px 288px hsl(1555.2, 100%, 50%), 20px 289px hsl(1560.6, 100%, 50%), 18px 290px hsl(1566, 100%, 50%), 16px 291px hsl(1571.4, 100%, 50%), 14px 292px hsl(1576.8, 100%, 50%), 13px 293px hsl(1582.2, 100%, 50%), 11px 294px hsl(1587.6, 100%, 50%), 9px 295px hsl(1593, 100%, 50%), 7px 296px hsl(1598.4, 100%, 50%), 5px 297px hsl(1603.8, 100%, 50%), 3px 298px hsl(1609.2, 100%, 50%), 1px 299px hsl(1614.6, 100%, 50%), 2px 300px hsl(1620, 100%, 50%), -1px 301px hsl(1625.4, 100%, 50%), -3px 302px hsl(1630.8, 100%, 50%), -5px 303px hsl(1636.2, 100%, 50%), -7px 304px hsl(1641.6, 100%, 50%), -9px 305px hsl(1647, 100%, 50%), -11px 306px hsl(1652.4, 100%, 50%), -13px 307px hsl(1657.8, 100%, 50%), -14px 308px hsl(1663.2, 100%, 50%), -16px 309px hsl(1668.6, 100%, 50%), -18px 310px hsl(1674, 100%, 50%), -20px 311px hsl(1679.4, 100%, 50%), -22px 312px hsl(1684.8, 100%, 50%), -23px 313px hsl(1690.2, 100%, 50%), -25px 314px hsl(1695.6, 100%, 50%), -27px 315px hsl(1701, 100%, 50%), -28px 316px hsl(1706.4, 100%, 50%), -30px 317px hsl(1711.8, 100%, 50%), -32px 318px hsl(1717.2, 100%, 50%), -33px 319px hsl(1722.6, 100%, 50%), -35px 320px hsl(1728, 100%, 50%), -36px 321px hsl(1733.4, 100%, 50%), -38px 322px hsl(1738.8, 100%, 50%), -39px 323px hsl(1744.2, 100%, 50%), -41px 324px hsl(1749.6, 100%, 50%), -42px 325px hsl(1755, 100%, 50%), -43px 326px hsl(1760.4, 100%, 50%), -45px 327px hsl(1765.8, 100%, 50%), -46px 328px hsl(1771.2, 100%, 50%), -47px 329px hsl(1776.6, 100%, 50%), -48px 330px hsl(1782, 100%, 50%), -49px 331px hsl(1787.4, 100%, 50%), -50px 332px hsl(1792.8, 100%, 50%), -51px 333px hsl(1798.2, 100%, 50%), -52px 334px hsl(1803.6, 100%, 50%), -53px 335px hsl(1809, 100%, 50%), -54px 336px hsl(1814.4, 100%, 50%), -55px 337px hsl(1819.8, 100%, 50%), -55px 338px hsl(1825.2, 100%, 50%), -56px 339px hsl(1830.6, 100%, 50%), -57px 340px hsl(1836, 100%, 50%), -57px 341px hsl(1841.4, 100%, 50%), -58px 342px hsl(1846.8, 100%, 50%), -58px 343px hsl(1852.2, 100%, 50%), -58px 344px hsl(1857.6, 100%, 50%), -59px 345px hsl(1863, 100%, 50%), -59px 346px hsl(1868.4, 100%, 50%), -59px 347px hsl(1873.8, 100%, 50%), -59px 348px hsl(1879.2, 100%, 50%), -59px 349px hsl(1884.6, 100%, 50%), -60px 350px hsl(1890, 100%, 50%), -59px 351px hsl(1895.4, 100%, 50%), -59px 352px hsl(1900.8, 100%, 50%), -59px 353px hsl(1906.2, 100%, 50%), -59px 354px hsl(1911.6, 100%, 50%), -59px 355px hsl(1917, 100%, 50%), -58px 356px hsl(1922.4, 100%, 50%), -58px 357px hsl(1927.8, 100%, 50%), -58px 358px hsl(1933.2, 100%, 50%), -57px 359px hsl(1938.6, 100%, 50%), -57px 360px hsl(1944, 100%, 50%), -56px 361px hsl(1949.4, 100%, 50%), -55px 362px hsl(1954.8, 100%, 50%), -55px 363px hsl(1960.2, 100%, 50%), -54px 364px hsl(1965.6, 100%, 50%), -53px 365px hsl(1971, 100%, 50%), -52px 366px hsl(1976.4, 100%, 50%), -51px 367px hsl(1981.8, 100%, 50%), -50px 368px hsl(1987.2, 100%, 50%), -49px 369px hsl(1992.6, 100%, 50%), -48px 370px hsl(1998, 100%, 50%), -47px 371px hsl(2003.4, 100%, 50%), -46px 372px hsl(2008.8, 100%, 50%), -45px 373px hsl(2014.2, 100%, 50%), -43px 374px hsl(2019.6, 100%, 50%), -42px 375px hsl(2025, 100%, 50%), -41px 376px hsl(2030.4, 100%, 50%), -39px 377px hsl(2035.8, 100%, 50%), -38px 378px hsl(2041.2, 100%, 50%), -36px 379px hsl(2046.6, 100%, 50%), -35px 380px hsl(2052, 100%, 50%), -33px 381px hsl(2057.4, 100%, 50%), -32px 382px hsl(2062.8, 100%, 50%), -30px 383px hsl(2068.2, 100%, 50%), -28px 384px hsl(2073.6, 100%, 50%), -27px 385px hsl(2079, 100%, 50%), -25px 386px hsl(2084.4, 100%, 50%), -23px 387px hsl(2089.8, 100%, 50%), -22px 388px hsl(2095.2, 100%, 50%), -20px 389px hsl(2100.6, 100%, 50%), -18px 390px hsl(2106, 100%, 50%), -16px 391px hsl(2111.4, 100%, 50%), -14px 392px hsl(2116.8, 100%, 50%), -13px 393px hsl(2122.2, 100%, 50%), -11px 394px hsl(2127.6, 100%, 50%), -9px 395px hsl(2133, 100%, 50%), -7px 396px hsl(2138.4, 100%, 50%), -5px 397px hsl(2143.8, 100%, 50%), -3px 398px hsl(2149.2, 100%, 50%), -1px 399px hsl(2154.6, 100%, 50%); font-size: 40px;";
//     console._log = console.log;
//     console.log = (...args) => {
//         const res = args.map(x=>[`%c${x}`, css]);
//         console._log(...flat(res));
//     };
// };
// setConsole();
const find = (source, needle, method = 'indexOf') => {
    const res = [];
    let cur = -1;

    do {
        cur = source[method](needle, cur + 1);
        if (cur === -1)
            break;
        res.push([cur, needle]);
    } while (true);

    return res;
};

const commentNeedles = ['//', '\n', '/*', '*/', '\'', '"', '`', '${', '}', '/'];
const scopeNeedles = ['{', '}'];

const binarySearch = (intervals, index, left = false) => {
    let low = 0;
    let high = intervals.length - 1;
    let mid = NaN;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (intervals[mid][0] <= index && index < intervals[mid][1]) return mid;
        else if (intervals[mid][1] < index) low = mid + 1;
        else high = mid - 1;
    }

    if (left)
        return low;

    return -1;
};

const findComments = (source) => {
    //(/\*([^*]|(\*+[^*/]))*\*+/)|(//.*)
    //((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))
    //const commentRegex = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/gm;


    const commentRegex = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.{0,})|(\'[^']{0,}[^\\]{0,1}\')|(\"[^"]{0,}[^\\]{0,1}\")|(\`.{0,}[^\\]{0,1}\$\{|\`\$\{)|(\}[^`]{0,}[^\\]{0,1}\`)|\/[^\/]{0,}[^\\]\/[gimX]{0,}(?=\s{0,}[;\,\)\=\+\-\.\n]|$))/gm;
    const res = [];
    // not efficient at all CHANGE THIS
    source.replace(commentRegex, (...args) => {
        let i = 1;
        while (typeof args[i] !== 'number') i++;
        res.push([args[i], args[i] + args[0].length]);
        return '';
    });
    return res;
};

const findNeedles = (source, needles) => {
    const needlePositions = [];
    for (let i = 0; i < needles.length; i++) {
        needlePositions.push(... find(source, needles[i]));
    }
    needlePositions.sort((a, b) => a[0] - b[0]);
    return needlePositions;
};

//debugging stuff

const loadTHREEJS = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/three.js/86/three${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadJQUERY = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadD3 = (cb, isMin = false) => {
    ajax.get(`https://cdnjs.cloudflare.com/ajax/libs/d3/4.9.1/d3${isMin ? '.min' : ''}.js`, {}, source => {
        cb(source);
    })
};

const loadOtherJS = (cb) => {
    ajax.get(`https://cdn.rodin.io/v0.0.7-dev/core/sculpt/Sculpt.js`, {}, source => {
        cb(source);
    })
};

//end

const reduce = (source, needles) => {
    const reducedSourceArray = new Array(needles.length);
    const reduceMap = [];

    for (let i = 0; i < needles.length; i++) {
        reducedSourceArray[i] = needles[i][1];
        for (let j = 0; j < reducedSourceArray[i].length; j++) {
            reduceMap.push(needles[i][0]);
        }
    }

    const reducedSource = reducedSourceArray.join('');
    return [reducedSource, reduceMap];
};

const jsDelimiterChars = ['=', '+', '-', '/', '*', '%', '(', ')', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^', '?', ' '].map(x => x.charCodeAt(0));


class StaticAnalyzer {
    constructor(source) {
        this.source = source;
        this._commentsAndStringsAnalyzed = false;
        this._lca = null;
        this._es6Scopes = null;
        this._es5Scopes = null;
        this._scopeData = [];

        this._es6ScopeGraphData = null;
        this._es5ScopeGraphData = null;

        this._es5ScopeMap = [];

        this._closingEs5ScopesSorted = [[], []];
        this._closingEs6ScopesSorted = [[], []];

        this._functionAndClassDeclarations = [[], [], []];
    }

    checkIfExpressionIsOver(index) {
        // todo: tidy this up, a lot of code repetition
        let a = index;
        let strArr = [];
        const skipParams = {cci: null};
        a = this.skipNonCodeNEW(a, skipParams, -1);
        if (this.source.charCodeAt(a) === '.'.charCodeAt(0) ||
            this.source.charCodeAt(a) === '('.charCodeAt(0) ||
            this.source.charCodeAt(a) === '['.charCodeAt(0)) {
            return false;
        }
        while (true) {
            // debugger;
            if (operatorChars.indexOf(this.source.charCodeAt(a)) === -1) {
                let [s, e] = this.getWordFromIndex(a);
                const subStr = this.source.substring(s, e);
                if (operatorWords.indexOf(subStr) !== -1) {
                    // str += subStr.reverse();
                    strArr.push(...subStr.split('').reverse());
                    a = s - 1;
                } else {
                    break;
                }
            }
            // str += this.source.charAt(a);
            strArr.push(this.source.charAt(a));
            a = this.skipNonCodeNEW(a - 1, skipParams, -1);
        }
        // console.log(str);
        let operatorStr = strArr.reverse().join('');
        strArr = [];
        // debugger;
        if (doEvalCheck(operatorStr)) {
            skipParams.cci = null;
            a = this.skipNonCodeNEW(index, skipParams);
            if (this.source.charCodeAt(a) === '.'.charCodeAt(0) ||
                this.source.charCodeAt(a) === '('.charCodeAt(0) ||
                this.source.charCodeAt(a) === '['.charCodeAt(0)) {
                return false;
            }
            while (true) {
                if (operatorChars.indexOf(this.source.charCodeAt(a)) === -1) {
                    let [s, e] = this.getWordFromIndex(a);
                    const subStr = this.source.substring(s, e);
                    if (operatorWords.indexOf(subStr) !== -1) {
                        strArr.push(subStr);
                        a = e;
                    } else {
                        break;
                    }
                }
                // str += this.source.charAt(a);
                strArr.push(this.source.charAt(a));
                a = this.skipNonCodeNEW(a + 1, skipParams);
            }

            operatorStr += strArr.join('');
            if (!doEvalCheck(operatorStr, 0)) {
                // saveScope(bracketType, StaticAnalyzer.scopeTypes.singleStatement);
                return true;
            }
        }
        return false;
    };

    analyzeCommentsAndStrings() {
        // const allNeedles = findNeedles(this.source, scopeNeedles);
        // const needles = [];
        // for (let i = 0; i < allNeedles.length; i++) {
        //     if (!this.isCommentOrString(allNeedles[i][0])) {
        //         needles.push(allNeedles[i]);
        //     }
        // }
        // window.allNeedles = allNeedles;
        // window.needles = needles;

        // if we have something like
        // / somefunction() // comemnt and stuff
        // some other stuff
        // this will start looking at / thinking its a regex
        // then stumble upon \n in the end of the line
        // dismiss the regex, and lose // comment in the middle

        const commentsAndStrings = [];
        const commentAndStringTypes = [];
        const instances = [];
        const es6Scopes = [[], []];
        //const es5Scopes = [[], []];

        const scopeGraph = [];

        const scopeStack = [];
        let scopeStackSize = 0;

        this._scopeString = '';


        this._commentsAndStrings = commentsAndStrings;
        this._commentsAndStringsTypes = commentAndStringTypes;
        this._commentsAndStringsAnalyzed = true;
        this._es6Scopes = es6Scopes;
        this._es6ScopeGraphData = scopeGraph;


        const s = {
            anything: 0,
            afterSlash: 1,
            string: 2,
            literalString: 3,
            comment: 4,
            multilineComment: 5,
            regex: 6,
            squareBracketsRegex: 7
        };

        const jsOneLiners = ['if', 'for', 'while'];

        const charsBeforeRegex = ['=', '+', '-', '/', '*', '%', '(', '[', ';', ':', '{', '}', '\n', '\r', ',', '!', '&', '|', '^', '?', '>', '<'];
        const charsAfterRegex = ['=', '+', '-', '/', '*', '%', ')', ']', ';', ',', '}'];

        // const oneLinerSplitters = ['+', '-', '/', '*', '%', '[', ']', '(', ')', '{', '}', '.'].map(x => x.charCodeAt(0));


        const wordsBeforeRegex = ['return', 'yield', 'typeof', 'case', 'do', 'else'];

        const length = this.source.length;
        let i = 0;
        let state = s.anything;
        let stringType = '"'.charCodeAt(0);
        let inLiteralString = false;

        let start = null;
        let scopeStart = null;

        let literalStringStackSize = 0;

        const skipNonCode = (j) => {
            let resI = commentsAndStrings.length - 1;
            while (j >= 0 && (this.source.charCodeAt(j) <= 32 || /* || this.source.charCodeAt(j) === 10 || /!*this.source.charCodeAt(j) === 9 ||*!/*/
            (resI >= 0 && commentsAndStrings[resI][0] < j && commentsAndStrings[resI][1] > j))) {
                j--;
                if (resI >= 0 && commentsAndStrings[resI][0] < j && commentsAndStrings[resI][1] > j) {
                    j = commentsAndStrings[resI][0] - 1;
                    resI--;
                }
            }
            return j;
        };

        const regexPrefixCheck = () => {
            let j = skipNonCode(i - 2);

            if (j < 0) {
                return true;
            }

            if (this.source.charAt(j) === '+' && this.source.charAt(j - 1) === '+') {
                return false;
            }

            if (this.source.charAt(j) === '-' && this.source.charAt(j - 1) === '-') {
                return false;
            }

            if (charsBeforeRegex.indexOf(this.source.charAt(j)) === -1) {

                // probably not very efficient
                // review this and possibly rewrite

                // // join this with 'while' 'for' and other things its literally 10 lines bellow
                // for (let g = 0; g < wordsBeforeRegex.length; g++) {
                //     let m = 0;
                //     const len = wordsBeforeRegex.length;
                //     const cur = wordsBeforeRegex[g];
                //     const curWordLen = wordsBeforeRegex[g].length;
                //     while (m < curWordLen && cur.charCodeAt(curWordLen - m - 1) === this.source.charCodeAt(j - m)) {
                //         m++;
                //     }
                //     if (m == curWordLen)
                //         return true;
                // }
                let roundBrackets = false;
                if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                    roundBrackets = true;
                    let bracketStack = 1;
                    while (bracketStack) {
                        j = skipNonCode(--j);
                        if (this.source.charCodeAt(j) === '('.charCodeAt(0)) {
                            bracketStack--;
                        } else if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                            bracketStack++;
                        }
                    }
                    j--;
                }
                j = skipNonCode(j);

                const wordEnd = j + 1;

                while (j >= 0 && jsDelimiterChars.indexOf(this.source.charCodeAt(j)) === -1) {
                    j--;
                }
                const wordStart = j + 1;
                //console.log(this.source.substring(wordStart, wordEnd));

                // refactor this if, better ways to write it as a single expression
                if (roundBrackets && jsOneLiners.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                } else if (!roundBrackets && wordsBeforeRegex.indexOf(this.source.substring(wordStart, wordEnd)) !== -1) {
                    return true;
                }

                return false;
            }
            return true;
        };

        const es5Scopes = ['function', 'function*'];

        // const scopeHandles = {}, scopeGraphHandles = {};
        //
        // scopeHandles[StaticAnalyzer.scopeTypes.es5] = this._es5Scopes;
        // scopeHandles[StaticAnalyzer.scopeTypes.es6] = this._es6Scopes;
        //
        // scopeGraphHandles[StaticAnalyzer.scopeTypes.es5] = this._es5ScopeGraphData;
        // scopeGraphHandles[StaticAnalyzer.scopeTypes.es6] = this._es6ScopeGraphData;


        const sourceContainsFrom = (arr, j) => {
            const len = arr.length;
            let i = 0;
            let cur = '';
            let curLength = 0;
            while (i < len) {
                if (curLength !== arr[i].length) {
                    curLength = arr[i].length;
                    cur = this.source.substr(j - arr[i].length + 1, arr[i].length);
                }
                if (cur === arr[i]) {
                    return i;
                }

                i++;
            }
            return -1;
        };

        const bracketStack = [];

        const brackets = [
            '['.charCodeAt(0), '('.charCodeAt(0), '{'.charCodeAt(0), -1 /*single line scope*/,
            ']'.charCodeAt(0), ')'.charCodeAt(0), '}'.charCodeAt(0), -2 /*single line scope*/,
        ];


        //todo: one line arrow functions, for, if, while, do
        // const saveScope = (bracket, scopeType = StaticAnalyzer.scopeTypes.es6) => {
        //
        //     let isOpening = false;
        //     let scopeStart = i;
        //     let j = i;
        //
        //     // todo: make a debug flag for these things
        //     this._scopeString += String.fromCharCode(bracket);
        //
        //     switch (scopeType) {
        //         case StaticAnalyzer.scopeTypes.arrowFunction:
        //             // debugger;
        //             [i, _] = this.skipNonCode(i + 2);
        //             scopeStart = i;
        //             i++;
        //             let c = j - 1;
        //             c--;
        //             [c, _] = this.skipNonCode(c, -1); // add curCommentIndex
        //             let closingRoundBracket = c;
        //             let openingRoundBracket = null;
        //
        //             if (this.source.charCodeAt(c) !== ')'.charCodeAt(0)) {
        //                 closingRoundBracket++;
        //                 c = this.getWordFromIndex(c)[0];
        //                 // todo: figure out if this if j or j+1
        //                 openingRoundBracket = c;
        //             } else {
        //                 [c, _] = this.skipBrackets(c); //  add curCommentIndex
        //                 openingRoundBracket = c;
        //             }
        //
        //             scopeType = StaticAnalyzer.scopeTypes.arrowFunction;
        //
        //             if (this.source.charCodeAt(i - 1) !== '{'.charCodeAt(0)) {
        //                 scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
        //                 bracketStack.push(-1);
        //             }
        //
        //             this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
        //
        //
        //             isOpening = true;
        //             break;
        //         case StaticAnalyzer.scopeTypes.expression:
        //             isOpening = false;
        //             bracketStack.pop();
        //             break;
        //     }
        //
        //     if (bracket === '{'.charCodeAt(0)) {
        //         bracketStack.push(bracket);
        //         isOpening = true;
        //         j = skipNonCode(i - 1);
        //
        //         // checking if the scope is a function
        //         if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
        //             const closingRoundBracket = j;
        //
        //             [j, _] = this.skipBrackets(j);
        //             const openingRoundBracket = j;
        //
        //             let tmpI = 0;
        //
        //             while (tmpI++ < 2) {
        //                 j--;
        //                 [j, _] = this.skipNonCode(j, -1); // add curCommentIndex
        //                 const nextWord = this.getWordFromIndex(j);
        //                 const cur = this.source.substring(nextWord[0], nextWord[1]);
        //                 j = nextWord[0];
        //                 // const fcn = function(a,b,c){...}
        //                 if (es5Scopes.indexOf(cur) !== -1) {
        //                     scopeType = StaticAnalyzer.scopeTypes.function;
        //                     this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
        //                     // scopeStart = j;
        //                 }
        //             }
        //
        //         }
        //
        //     }
        //
        //
        //     if (isOpening) {
        //         // we put everything in es6 scopes since it contains all other types
        //         // then we distinguish them later.
        //         const scopes = this._es6Scopes;
        //
        //         // add new scope we just found to the graph
        //         scopeGraph.push([]);
        //         // check if there is a scope which contains it
        //         if (scopeGraph[scopeStack[scopeStackSize - 1]]) {
        //             // push the current scope to its parent
        //             // note: es6Scopes[0].length without -1 because \
        //             // we haven't yet added the current one
        //             scopeGraph[scopeStack[scopeStackSize - 1]].push(es6Scopes[0].length);
        //         }
        //         // add both beginning and ending of the scope we found
        //         // the ending is NaN because we will fill it in later
        //         es6Scopes[0].push(scopeStart);
        //         es6Scopes[1].push(NaN);
        //         // check if our array has enough space to add an element
        //         if (scopeStack.length < scopeStackSize) {
        //             // if it does not use .push
        //             scopeStack.push(es6Scopes[0].length - 1);
        //         }
        //         else {
        //             // otherwise just set the element we need
        //             scopeStack[scopeStackSize] = es6Scopes[0].length - 1;
        //         }
        //         scopeStackSize++;
        //     } else {
        //         // change the value we put as NaN earlier
        //         es6Scopes[1][scopeStack[scopeStackSize - 1]] = i;
        //         this._closingEs6ScopesSorted[0].push(i);
        //         this._closingEs6ScopesSorted[1].push(scopeStack[scopeStackSize - 1]);
        //
        //         scopeStackSize--;
        //         bracketStack.pop();
        //     }
        //     console.log(scopeStart, scopeType.toString(2));
        //
        //     //es6Scopes.push([i, bracket]);
        // };

        const saveResult = (end = i) => {
            instances.push(this.source.substring(start, end + 1));
            commentsAndStrings.push([start, end + 1]);
            commentAndStringTypes.push(state);
        };

        let isOneLinerEnter = false;

        while (i < length) {
            const cur = this.source.charCodeAt(i);

            switch (state) {
                case s.anything:

                    // if (isOneLinerEnter && bracketStack[bracketStack.length - 1] === -1 &&
                    //     oneLinerSplitters.indexOf(this.source.charCodeAt(i)) === -1) {
                    //     isOneLinerEnter = false;
                    //     // todo: check if this saves one more character after the scope
                    //     saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                    // }

                    start = i;
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.afterSlash;
                    } else if (cur === '"'.charCodeAt(0) || cur === '\''.charCodeAt(0)) {
                        state = s.string;
                        stringType = cur;
                    } else if (cur === '`'.charCodeAt(0)) {
                        literalStringStackSize++;
                        state = s.literalString;
                    } else if (inLiteralString && cur === '}'.charCodeAt(0)) {
                        state = s.literalString;
                        inLiteralString = false;
                        // } else if (cur === '{'.charCodeAt(0)) {
                        //     saveScope(cur);
                        // } else if (cur === '}'.charCodeAt(0)) {
                        //     saveScope(cur);
                        // } else if (cur === '='.charCodeAt(0) && this.source.charCodeAt(i + 1) === '>'.charCodeAt(0)) {
                        //     saveScope(cur, StaticAnalyzer.scopeTypes.arrowFunction);
                        // } else if (bracketStack[bracketStack.length - 1] === -1) {
                        //     if (cur === ';'.charCodeAt(0)) {
                        //         saveScope(-2, StaticAnalyzer.scopeTypes.expression); // one line code has come to an end
                        //     } else if (cur === '\n'.charCodeAt(0)) {
                        //         let tmp = this.skipNonCode(i, -1)[0];
                        //         // todo: this doesn't work if a oneliner is directly in the end of the file
                        //         if (oneLinerSplitters.indexOf(this.source.charCodeAt(tmp)) === -1) {
                        //             // todo: figure out how to skip code here so we can check after \n
                        //             saveScope(-2, StaticAnalyzer.scopeTypes.expression); // one line code has come to an end
                        //             // isOneLinerEnter = true;
                        //         }
                        //     }
                        // } else {
                        //     const bracket = brackets.indexOf(cur);
                        //     if (bracket !== -1) {
                        //         if (bracket < brackets.length / 2) { // opening
                        //             bracketStack.push(bracket);
                        //         }
                        //         else { // closing
                        //             bracketStack.pop();
                        //         }
                        //     }
                        // }
                    }

                    break;
                case s.afterSlash:
                    if (cur === '/'.charCodeAt(0)) {
                        state = s.comment;
                    } else if (cur === '*'.charCodeAt(0)) {
                        state = s.multilineComment;
                    } else if (regexPrefixCheck()) {
                        // if (cur === '\\'.charCodeAt(0)) {
                        //     i++;
                        // }
                        state = s.regex;
                        i -= 1;
                    } else {
                        state = s.anything;
                        i -= 1;
                    }
                    break;
                case s.comment:
                    if (cur === '\n'.charCodeAt(0) || i === length - 1) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.multilineComment:
                    if (cur === '*'.charCodeAt(0) && this.source.charCodeAt(i + 1) === '/'.charCodeAt(0)) {
                        i++;
                        saveResult(i);
                        state = s.anything;
                    }
                    break;
                case s.regex:

                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '\n'.charCodeAt(0)) {
                        state = s.anything;
                        i = start;
                    } else if (cur === '['.charCodeAt(0)) {
                        state = s.squareBracketsRegex;
                    } else if (cur === '/'.charCodeAt(0)) {
                        // if (regexSuffixCheck()) {
                        //     saveResult();
                        // }
                        // else {
                        //     i = start;
                        // }
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.squareBracketsRegex:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === ']'.charCodeAt(0)) {
                        state = s.regex;
                    }
                    break;
                case s.string:
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === stringType) {
                        saveResult();
                        state = s.anything;
                    }
                    break;
                case s.literalString:
                    // ` camels ${10 + `${20}`} `
                    // this is also valid reflow to work
                    if (cur === '\\'.charCodeAt(0)) {
                        i++;
                    } else if (cur === '$'.charCodeAt(0) && this.source.charCodeAt(i + 1) === '{'.charCodeAt(0)) {
                        i++;
                        saveResult();
                        state = s.anything;
                        inLiteralString = true;
                    } else if (cur === '`'.charCodeAt(0)) {
                        saveResult();
                        literalStringStackSize--;
                        if (literalStringStackSize) {
                            inLiteralString = true;
                        }
                        state = s.anything;
                    }
                    break;
            }
            i++;
        }

        //console.log(commentsAndStrings);
        //console.log(instances);
        //window.instances = instances;

        //return commentsAndStrings;
    }

    analyzeScopes() {
        const n = this.source.length;
        let i = 0;

        const es6Scopes = this._es6Scopes;
        const es6ScopeGraph = this._es6ScopeGraphData;
        this._es5Scopes = [[], [], []];
        const es5Scopes = this._es5Scopes;
        this._es5ScopeGraphData = [];
        const es5ScopeGraph = this._es5ScopeGraphData;

        // const es6ScopeGraph = this._es6ScopeGraphData;

        // 0 stands for the global scope
        const scopeStack = [];
        let scopeStackSize = 0;
        this._scopeData.push();


        const bracketStack = [];
        const popBracketStack = (bracket) => {
            const last = bracketStack[bracketStack.length - 1];
            if (bracket !== last) {
                if (last === -1) {
                    saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                } else if (last === -3) {
                    saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                }
            }
            return bracketStack.pop();
        };


        const s = {
            anything: 0
        };

        const bracketMap = {
            ['('.charCodeAt(0)]: ')'.charCodeAt(0),
            ['['.charCodeAt(0)]: ']'.charCodeAt(0),
            ['{'.charCodeAt(0)]: '}'.charCodeAt(0),
            [')'.charCodeAt(0)]: '('.charCodeAt(0),
            [']'.charCodeAt(0)]: '['.charCodeAt(0),
            ['}'.charCodeAt(0)]: '{'.charCodeAt(0),
            [-1]: -2,
            [-2]: -1,
            [-3]: -4,
            [-4]: -3
        };

        let state = s.anything;
        let curCommentIndex = {cci: null};
        // let curCommentIndex = 0;
        // const oneLinerSplitters = ['+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));
        const es5Functions = ['function', 'function*'];

        // const expressionSplitters = [',', '+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));
        // const statementSplitters = ['+', '-', '/', '*', '%', '[', ']', '}', '(', '.'].map(x => x.charCodeAt(0));

        // const bothOperators = ['+', '-', '/', '*', '%', '>', '<', '&', '|', '^', '=', '>=', '<=', '&=', '|=', '^=', '!=', '!==', '===', '<<=', '>>=', '>>>=', '?', ':', 'in', 'instanceof'];
        // const leftOperators = ['delete', 'typeof', 'void', '...', '++', '--', '~'];
        // const rightOperators = ['++', '--'];


        /**
         * checks if the there is a function or class at the given position
         * if type is 0 checks only for function,
         * if type is 1 checks only for class
         * @param j
         * @param type
         * @return {*}
         */
        const checkIfClassOrFunction = (j, type = 0) => {
            let scopeData = [StaticAnalyzer.scopeTypes.es6];
            let closingRoundBracket = null, openingRoundBracket = null;

            // only need to do this for functions, classes dont have ()
            if (type === 0) {
                closingRoundBracket = j + 1;
                [j, _] = this.skipBrackets(j);
                // todo: @gor this.skipBrackets returns the results with -1 offset, fix this
                openingRoundBracket = ++j;

                if (this._scopeData[scopeStack[scopeStackSize - 1]] &&
                    this._scopeData[scopeStack[scopeStackSize - 1]][0] === StaticAnalyzer.scopeTypes.class) {
                    let scopeType = StaticAnalyzer.scopeTypes.function;
                    return [scopeType, [openingRoundBracket, closingRoundBracket]];
                }
            }


            let tmpI = 0;
            let fcnOrClassName;

            while (tmpI < 2) {
                // j--;
                // [j, _] = this.skipNonCode(j, -1); // add curCommentIndex
                j = this.skipNonCodeNEW(--j, cOBJ, -1);
                const nextWord = this.getWordFromIndex(j);
                const cur = this.source.substring(nextWord[0], nextWord[1]);
                if (tmpI === 0)
                    fcnOrClassName = cur;
                j = nextWord[0];
                // const fcn = function(a,b,c){...}
                if (type === 0 && es5Functions.indexOf(cur) !== -1) {
                    let scopeType = StaticAnalyzer.scopeTypes.function;
                    scopeData = [scopeType, [openingRoundBracket, closingRoundBracket]];
                    break;
                } else if (type === 1 && cur === 'class') {
                    let scopeType = StaticAnalyzer.scopeTypes.class;
                    scopeData = [scopeType];
                    break;
                }
                tmpI++;
            }

            if (tmpI > 0 &&
                (scopeData[0] === StaticAnalyzer.scopeTypes.class ||
                scopeData[0] === StaticAnalyzer.scopeTypes.function)) {
                this._functionAndClassDeclarations[0].push(fcnOrClassName);
                this._functionAndClassDeclarations[1].push(j);
                this._functionAndClassDeclarations[2].push(type);
            }

            return scopeData;
        };

        //todo: one line arrow functions, for, if, while, do
        const saveScope = (bracket, scopeType = StaticAnalyzer.scopeTypes.es6) => {
            let scopeData = [StaticAnalyzer.scopeTypes.es6];

            let isOpening = false;
            let scopeStart = i;
            let scopeEnd = i;
            let j = i;
            // cur comment index!!!!!
            let cci = 0;
            const skipParams = {cci: null};
            let c = null;
            // todo: make a debug flag for these things
            this._scopeString += String.fromCharCode(bracket);

            switch (scopeType) {
                case StaticAnalyzer.scopeTypes.es5:  // the global scope
                    // make this a constant
                    if (bracket === 11116666) {
                        isOpening = true;
                        scopeData = [scopeType];
                    } else {
                        isOpening = false;
                    }

                    break;
                case StaticAnalyzer.scopeTypes.arrowFunction:
                    // debugger;
                    i = this.skipNonCodeNEW(i + 2, cOBJ);
                    scopeStart = i;
                    curCommentIndex.cci = null;
                    c = j - 1;
                    c = this.skipNonCodeNEW(c, skipParams, -1); // add curCommentIndex
                    let closingRoundBracket = c;
                    let openingRoundBracket = null;

                    // a=>{}
                    if (this.source.charCodeAt(c) !== ')'.charCodeAt(0)) {
                        closingRoundBracket++;
                        c = this.getWordFromIndex(c)[0];
                        // todo: figure out if this if j or j+1
                        openingRoundBracket = c + 1;
                    } else {
                        // (a,b,c)=>
                        [c, cci] = this.skipBrackets(c, cci); //  add curCommentIndex
                        openingRoundBracket = c + 1;
                    }

                    // scopeType = StaticAnalyzer.scopeTypes.arrowFunction;

                    // if (this.source.charCodeAt(i - 1) !== '('.charCodeAt(0)) {
                    //     scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
                    //     bracket = -3; // round bracket
                    // } else
                    if (this.source.charCodeAt(i) !== '{'.charCodeAt(0)) {
                        // revert back one character so things like ({}) will work
                        i -= 2;
                        curCommentIndex.cci = null;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.expression;
                        bracket = -1; // no bracket at all
                    }

                    // this._scopeData.push([scopeType, [openingRoundBracket, closingRoundBracket]]);
                    scopeData = [scopeType, [openingRoundBracket, closingRoundBracket]];

                    isOpening = true;
                    break;
                case StaticAnalyzer.scopeTypes.singleStatement:
                case StaticAnalyzer.scopeTypes.expression:
                    isOpening = false;
                    scopeEnd = i - 1;

                    // bracketStack.pop();
                    break;
                case StaticAnalyzer.scopeTypes.for:
                    isOpening = true;
                    scopeStart = i;
                    i = this.skipNonCodeNEW(i + 3, skipParams);
                    [i, _] = this.skipBrackets(i, skipParams.cci);
                    i = this.skipNonCodeNEW(++i, skipParams);

                    // i++;

                    if (this.source.charCodeAt(i) !== '{'.charCodeAt(0)) {
                        // revert back one character so things like ({}) will work
                        // not sure if -=2 or -=1
                        i -= 2;
                        scopeType = scopeType | StaticAnalyzer.scopeTypes.singleStatement;
                        bracket = -3; // no bracket at all, but a statement instead of an expression
                    }
                    curCommentIndex.cci = null;
                    // this._scopeData.push([scopeType, []]);
                    scopeData = [scopeType];
                    break;
            }


            if (bracket === '{'.charCodeAt(0)) {
                // bracketStack.push(bracket);
                isOpening = true;
                // [j, _] = this.skipNonCode(i - 1, -1);
                j = this.skipNonCodeNEW(--j, cOBJ, -1);

                // checking if the scope is a function
                if (this.source.charCodeAt(j) === ')'.charCodeAt(0)) {
                    scopeData = checkIfClassOrFunction(j, 0); // check for a function
                } else {
                    scopeData = checkIfClassOrFunction(j, 1); // check for a class
                }

            }

            if (bracket === '}'.charCodeAt(0)) {
                isOpening = false;
                if (this._scopeData[scopeStart[scopeStack.length - 1]] &&
                    this._scopeData[scopeStart[scopeStack.length - 1]][0] === StaticAnalyzer.scopeTypes.destruction) {
                    scopeType = StaticAnalyzer.scopeTypes.destruction;
                    this._scopeData[scopeStack[scopeStackSize - 1]] = [scopeType];
                } else {
                    j = this.skipNonCodeNEW(++j, cOBJ);
                    if (this.source.charCodeAt(j) === '='.charCodeAt(0)) {
                        scopeType = StaticAnalyzer.scopeTypes.destruction;
                        this._scopeData[scopeStack[scopeStackSize - 1]] = [scopeType];
                    }
                }
            }

            if (isOpening) {
                bracketStack.push(bracket);

                // we put everything in es6 scopes since it contains all other types
                // then we distinguish them later.
                const scopes = this._es6Scopes;

                // add new scope we just found to the graph
                es6ScopeGraph.push([]);
                // check if there is a scope which contains it
                //if (es6ScopeGraph[scopeStack[scopeStackSize - 1]]) {
                if (scopeStackSize) {
                    // push the current scope to its parent
                    // note: es6Scopes[0].length without -1 because \
                    // we haven't yet added the current one
                    es6ScopeGraph[scopeStack[scopeStackSize - 1]].push(es6Scopes[0].length);
                }
                // add both beginning and ending of the scope we found
                // the ending is NaN because we will fill it in later
                es6Scopes[0].push(scopeStart);
                es6Scopes[1].push(NaN);
                // check if our array has enough space to add an element
                if (scopeStack.length < scopeStackSize) {
                    // if it does not use .push
                    scopeStack.push(es6Scopes[0].length - 1);
                }
                else {
                    // otherwise just set the element we need
                    scopeStack[scopeStackSize] = es6Scopes[0].length - 1;
                }
                scopeStackSize++;
                this._scopeData.push(scopeData);
            } else {
                // change the value we put as NaN earlier
                es6Scopes[1][scopeStack[scopeStackSize - 1]] = scopeEnd;
                this._closingEs6ScopesSorted[0].push(scopeEnd);
                this._closingEs6ScopesSorted[1].push(scopeStack[scopeStackSize - 1]);

                // todo: this definitely needs major refactoring
                scopeStackSize--;
                while (true) {
                    // const last = bracketStack.pop();
                    bracketStack[bracketStack.length - 1];
                    const last = popBracketStack(bracketMap[bracket]);
                    if (!last || !bracketStack.length || last > 0 || bracketStack[bracketStack.length - 1] > 0)
                        break;
                    saveScope(bracketStack[bracketStack.length - 1] - 1, StaticAnalyzer.scopeTypes.expression);
                }
            }
            // console.log(scopeStart, scopeType.toString(2));

            //es6Scopes.push([i, bracket]);
        };

        // open the global scope
        saveScope(StaticAnalyzer.globalScopeBracket, StaticAnalyzer.scopeTypes.es5);


        while (i < n) {
            const cur = this.source.charCodeAt(i);

            if (cur === '{'.charCodeAt(0)) {
                saveScope(cur);
            } else if (cur === '}'.charCodeAt(0)) {
                saveScope(cur);
            } else if (cur === '='.charCodeAt(0) && this.source.charCodeAt(i + 1) === '>'.charCodeAt(0)) {
                saveScope(cur, StaticAnalyzer.scopeTypes.arrowFunction);
            } else if (jsDelimiterChars.indexOf(this.source.charCodeAt(i - 1)) !== -1 &&
                jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1 &&
                // cur === 'f'.charCodeAt(0) &&
                // this.source.charCodeAt(i + 1) === 'o'.charCodeAt(0) &&
                // this.source.charCodeAt(i + 2) === 'r'.charCodeAt(0)
                this.source.substr(i, 3) === 'for') {
                saveScope(cur, StaticAnalyzer.scopeTypes.for);
            } else {



                // arrow functions, e.g. a = (a,b,c,d)=>a+b+c+typeof d
                if (bracketStack[bracketStack.length - 1] === -1) {
                    if (cur === ';'.charCodeAt(0) || cur === ','.charCodeAt(0)) {
                        saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                    } else if (cur === '\n'.charCodeAt(0)) {
                        if (this.checkIfExpressionIsOver(i)) {
                            saveScope(-2, StaticAnalyzer.scopeTypes.expression);
                        }
                    }
                }

                // for loops e.g. for (let i=0;i<10;i++) console.log(i), i++, true, i--
                if (bracketStack[bracketStack.length - 1] === -3) {
                    if (cur === ';'.charCodeAt(0)) {
                        saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                    } else if (cur === '\n'.charCodeAt(0)) {
                        if (this.checkIfExpressionIsOver(i)) {
                            saveScope(-4, StaticAnalyzer.scopeTypes.singleStatement);
                        }
                    }
                }

                if (cur === '('.charCodeAt(0) || cur === '['.charCodeAt(0)) {
                    bracketStack.push(cur);
                } else if (cur === ')'.charCodeAt(0)) {
                    popBracketStack('('.charCodeAt(0));
                } else if (cur === ']'.charCodeAt(0)) {
                    popBracketStack('('.charCodeAt(0));
                }


            }
            // console.log(i);
            i = this.skipNonCodeNEW(++i, curCommentIndex, 1, true, true, false);
            // i = this.skipNonCodeNEW(++i, cOBJ, 1, true, true, false);

            // [i, curCommentIndex] = this.skipNonCode(++i, 1, curCommentIndex, true, true, false);
            // i++;

        }

        // close the global scope
        saveScope(1, StaticAnalyzer.scopeTypes.es5);

        {
            const n = es6Scopes[0].length;
            const scopeStack = [];
            const allScopes = [];

            // start numerating k(scope indexes) from 1, because 0 is the global scope
            for (let i = 0, k = 0; i < n; i++) {
                if (this._scopeData[i][0] >> 10) {
                    continue;
                }

                es5Scopes[0].push(es6Scopes[0][i]);
                es5Scopes[1].push(es6Scopes[1][i]);

                es5Scopes[2].push(k);
                allScopes.push([es6Scopes[0][i], k, 0]);
                allScopes.push([es6Scopes[1][i], k, 1]);
                k++;
                this._es5ScopeMap.push(i);
            }
            allScopes.sort((a, b) => a[0] - b[0]);
            const m = allScopes.length;

            for (let i = 0; i < m; i++) {
                if (!allScopes[i][2]) {
                    es5ScopeGraph.push([]);
                    if (scopeStack.length) {
                        es5ScopeGraph[scopeStack[scopeStack.length - 1]].push(allScopes[i][1]);
                    }
                    scopeStack.push(allScopes[i][1]);

                } else {
                    this._closingEs5ScopesSorted[0].push(es5Scopes[allScopes[i][1]]);
                    this._closingEs5ScopesSorted[1].push(allScopes[i][1]);
                    scopeStack.pop();
                }
            }
        }

        this._es5ScopeGraph = new Graph(this._es5ScopeGraphData);
        this._es6ScopeGraph = new Graph(this._es6ScopeGraphData);
        this._es5ScopeGraph.analyze();
        this._es6ScopeGraph.analyze();
    }

    isCommentOrString(index) {
        if (!this._commentsAndStringsAnalyzed) {
            // not analyzed
            return false;
        }

        // make this O(log(n)) with a set, maybe make it conditional even
        // for (let i = 0; i < this._commentsAndStrings.length; i++) {
        //     if (this._commentsAndStrings[i][0] <= index && index <= this._commentsAndStrings[i][1]) {
        //         return true;
        //     }
        // }
        // return false;

        return binarySearch(this._commentsAndStrings, index) !== -1;
    }

    // todo: add a direction to this
    skipNonCode(j, direction = 1, curCommentIndex = binarySearch(this._commentsAndStrings, j, true), skipComments = true, skipWhitespace = true, skipNewLine = true) {
        const oldJ = j;
        if (isNaN(curCommentIndex))
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

        // todo: @sergi het es pah@ qnnarkel mihat
        if (curCommentIndex === true || curCommentIndex === false) {
            skipNewLine = skipWhitespace;
            skipWhitespace = skipComments;
            skipComments = curCommentIndex;
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);
        }

        while (j < this.source.length && j >= 0) {
            if (skipComments && curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1]) {

                j = this._commentsAndStrings[curCommentIndex][direction === 1 ? 1 : 0];
                if (direction === -1) {
                    j--;
                }

                curCommentIndex += direction;
                continue;
            }

            // todo: remove it when all refactoring will done
            // if (this.source.charCodeAt(j) <= 32) {
            //     j += direction;
            //     continue;
            // }

            if ((skipNewLine && this.source.charCodeAt(j) === 10) || (skipWhitespace && this.source.charCodeAt(j) <= 32 && this.source.charCodeAt(j) !== 10)) {
                j += direction;
                continue;
            }

            break;
        }

        return [j, curCommentIndex, oldJ !== j];
    };

    skipNonCodeNEW(j, params, direction = 1, skipComments = true, skipWhitespace = true, skipNewLine = true) {
        const oldJ = j;
        let curCommentIndex = params.cci;
        if (curCommentIndex !== 0 && !curCommentIndex) {
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);
        }

        while (j < this.source.length && j >= 0) {
            if (skipComments && curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1]) {

                j = this._commentsAndStrings[curCommentIndex][direction === 1 ? 1 : 0];
                if (direction === -1) {
                    j--;
                }

                curCommentIndex += direction;
                continue;
            }

            if ((skipNewLine && this.source.charCodeAt(j) === 10) || (skipWhitespace && this.source.charCodeAt(j) <= 32 && this.source.charCodeAt(j) !== 10)) {
                j += direction;
                continue;
            }

            break;
        }
        if (params.hasOwnProperty('cci')) {
            params.cci = curCommentIndex;
        }
        if (params.hasOwnProperty('skipped')) {
            params.skipped = oldJ === j;
        }

        return j;
    };

    skipBracketsNEW(j, params, forward = true, backward = true) {
        let oldJ = j;
        const bracket = this.source.charCodeAt(j);

        let curCommentIndex = params.cci;
        if (curCommentIndex !== 0 && !curCommentIndex) {
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);
        }

        const isOpening = ['{'.charCodeAt(0), '('.charCodeAt(0), '['.charCodeAt(0)].indexOf(bracket) !== -1;
        const isClosing = ['}'.charCodeAt(0), ')'.charCodeAt(0), ']'.charCodeAt(0)].indexOf(bracket) !== -1;

        if (!isOpening && !isClosing)
            return oldJ;

        if (isOpening && !forward || isClosing && !backward)
            return oldJ;

        if (bracket === '{'.charCodeAt(0)) {
            if (params.hasOwnProperty('cci')) {
                params.cci = NaN;
            }
            return this._es6Scopes[1][this._es6Scopes[0].indexOf(j)];
        } else if (bracket === '}'.charCodeAt(0)) {
            if (params.hasOwnProperty('cci')) {
                params.cci = NaN;
            }
            return this._es6Scopes[0][this._es6Scopes[1].indexOf(j)] - 1;
        }

        let reverseBracket;
        if (bracket === '('.charCodeAt(0))
            reverseBracket = ')'.charCodeAt(0);

        if (bracket === ')'.charCodeAt(0))
            reverseBracket = '('.charCodeAt(0);

        if (bracket === '['.charCodeAt(0))
            reverseBracket = ']'.charCodeAt(0);

        if (bracket === ']'.charCodeAt(0))
            reverseBracket = '['.charCodeAt(0);

        let stack = 1;
        const direction = isOpening ? 1 : -1;
        j += direction;
        while (j < this.source.length && j >= 0) {
            j = this.skipNonCodeNEW(j, params, direction);

            if (bracket === this.source.charCodeAt(j)) {
                stack++;
            } else if (reverseBracket === this.source.charCodeAt(j)) {
                stack--;

                if (stack === 0)
                    return isOpening ? j : j - 1;
            }

            j += direction;
        }

        if (params.hasOwnProperty('cci')) {
            params.cci = curCommentIndex;
        }

        if (params.hasOwnProperty('skipped')) {
            params.skipped = oldJ === j;
        }

        return oldJ;
    };

    skipBrackets(j, curCommentIndex = binarySearch(this._commentsAndStrings, j, true), forward = true, backward = true) {
        let oldJ = j;
        const bracket = this.source.charCodeAt(j);

        if (curCommentIndex === true || curCommentIndex === false) {
            backward = forward;
            forward = curCommentIndex;
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);
        }

        const isOpening = ['{'.charCodeAt(0), '('.charCodeAt(0), '['.charCodeAt(0)].indexOf(bracket) !== -1;
        const isClosing = ['}'.charCodeAt(0), ')'.charCodeAt(0), ']'.charCodeAt(0)].indexOf(bracket) !== -1;

        if (!isOpening && !isClosing)
            return [oldJ, curCommentIndex];

        if (isOpening && !forward || isClosing && !backward)
            return [oldJ, curCommentIndex];

        if (bracket === '{'.charCodeAt(0)) {
            curCommentIndex = NaN;
            return [this._es6Scopes[1][this._es6Scopes[0].indexOf(j)], curCommentIndex];
        } else if (bracket === '}'.charCodeAt(0)) {
            curCommentIndex = NaN;
            return [this._es6Scopes[0][this._es6Scopes[1].indexOf(j)] - 1, curCommentIndex];
        }

        let reverseBracket;
        if (bracket === '('.charCodeAt(0))
            reverseBracket = ')'.charCodeAt(0);

        if (bracket === ')'.charCodeAt(0))
            reverseBracket = '('.charCodeAt(0);

        if (bracket === '['.charCodeAt(0))
            reverseBracket = ']'.charCodeAt(0);

        if (bracket === ']'.charCodeAt(0))
            reverseBracket = '['.charCodeAt(0);

        let stack = 1;
        const direction = isOpening ? 1 : -1;
        j += direction;
        while (j < this.source.length && j >= 0) {
            [j, curCommentIndex] = this.skipNonCode(j, direction);

            if (bracket === this.source.charCodeAt(j)) {
                stack++;
            } else if (reverseBracket === this.source.charCodeAt(j)) {
                stack--;

                if (stack === 0)
                    return [isOpening ? j : j - 1, curCommentIndex];
            }

            j += direction;
        }

        return [oldJ, curCommentIndex];
    };

    skipNonCodeAndScopes(j, params, direction = 1, skipComments = true, skipWhitespace = true, skipNewLine = true) {
        const skipBracketsForward = direction === 1;

        let currJ;
        do {
            currJ = j;
            j = this.skipNonCodeNEW(j, params, direction, skipComments, skipWhitespace, skipNewLine);
            j = this.skipBracketsNEW(j, params, skipBracketsForward, !skipBracketsForward);
        } while (currJ !== j && j >= 0 && j < this.source.length);

        return j;
    }

    getWordFromIndex(i) {
        if (jsDelimiterChars.indexOf(this.source.charCodeAt(i)) !== -1)
            return [NaN, NaN];

        if (this.isCommentOrString(i))
            return [NaN, NaN];

        let start = i;
        let end = i;

        let currChar = this.source.charCodeAt(end);
        while (jsDelimiterChars.indexOf(currChar) === -1 && end < this.source.length) {
            end++;
            currChar = this.source.charCodeAt(end);
        }

        currChar = this.source.charCodeAt(start);
        while (jsDelimiterChars.indexOf(currChar) === -1 && start >= 0) {
            start--;
            currChar = this.source.charCodeAt(start);
        }

        return [start + 1, end];
    }

    nextString(j) {
        let curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

        while (j < this.source.length) {
            if (curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1] &&
                (this._commentsAndStringsTypes[curCommentIndex] === 4 || this._commentsAndStringsTypes[curCommentIndex] === 5)) {

                j = this._commentsAndStrings[curCommentIndex][1];
                curCommentIndex++;
                continue;
            }

            if (this.source.charCodeAt(j) <= 32) {
                j++;
                continue;
            }

            break;
        }

        return curCommentIndex;
    };

    findExports() {
        const rx = /(?:^|\s|\/|\)|\[|;|{|})(export)(?={|\s|\/)/gm;
        let match;
        const exportBeginnings = [];
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf('export') + match.index;
            if (this.isCommentOrString(curPos)) {
                continue;
            }
            exportBeginnings.push(curPos);
        }

        let curCommentIndex = NaN;

        const nextString = (j) => {
            curCommentIndex = binarySearch(this._commentsAndStrings, j, true);

            while (j < this.source.length) {
                if (curCommentIndex >= 0 && curCommentIndex < this._commentsAndStrings.length &&
                    this._commentsAndStrings[curCommentIndex][0] <= j && j <= this._commentsAndStrings[curCommentIndex][1] &&
                    (this._commentsAndStringsTypes[curCommentIndex] === 4 || this._commentsAndStringsTypes[curCommentIndex] === 5)) {

                    j = this._commentsAndStrings[curCommentIndex][1];
                    curCommentIndex++;
                    continue;
                }

                if (this.source.charCodeAt(j) <= 32) {
                    j++;
                    continue;
                }

                break;
            }

            return curCommentIndex;
        };

        const analyzeExport = (i, exportIndex) => {
            i += 6;
            const exportBeginning = i;

            const states = {
                start: 0,
                brackets: {
                    anything: 10,
                    var: 11,
                    as: 12,
                    label: 13
                },
                lcv: {
                    anything: 61,
                    var: 62,
                    afterEqual: 63
                },
                fc: {
                    anything: 40,
                    var: 41
                },
                from: 50,
                end: 100
            };

            const memory = {
                currVar: new Array(1000),
                currVarLength: 0,
                currLabel: new Array(1000),
                currLabelLength: 0,
                exportType: '',
                nonCodeSkipped: false,
                from: null
            };

            const currExportsArr = {
                exportIndexes: [],
                exportBeginnings: [],
                names: [],
                labels: [],
                isBrackets: [],
                isLet: [],
                isConst: [],
                isVar: [],
                isClass: [],
                isFunction: [],
                isGeneratorFunction: [],
                isAll: [],
                from: [],
            };

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                currExportsArr.exportIndexes.push(exportIndex);
                currExportsArr.exportBeginnings.push(exportBeginning);
                currExportsArr.names.push(name);
                currExportsArr.labels.push(label || name);
                currExportsArr.isBrackets.push(memory.exportType === 'brackets');
                currExportsArr.isLet.push(memory.exportType === 'let');
                currExportsArr.isConst.push(memory.exportType === 'const');
                currExportsArr.isVar.push(memory.exportType === 'var');
                currExportsArr.isClass.push(memory.exportType === 'class');
                currExportsArr.isFunction.push(memory.exportType === 'function');
                currExportsArr.isGeneratorFunction.push(memory.exportType === 'function*');
                currExportsArr.isAll.push(memory.exportType === '*');
                currExportsArr.from.push(memory.from);
            };

            const collectResults = () => {
                if (memory.from)
                    for (let i = 0; i < currExportsArr.from.length; i++)
                        currExportsArr.from[i] = memory.from

                return currExportsArr;
            };

            let state = states.start;

            while (i < this.source.length) {
                let j;
                [j, curCommentIndex] = this.skipNonCode(i);
                memory.nonCodeSkipped = i !== j;
                i = j;

                const currChar = this.source.charAt(i);
                const currCharCode = this.source.charCodeAt(i);

                switch (state) {
                    /**
                     * Checks export type
                     */
                    case states.start:
                        if (123 /* '{'.charCodeAt(0) */ === currCharCode) {
                            state = states.brackets.anything;
                            break;
                        }

                        if (42 /* '*'.charCodeAt(0) */ === currCharCode) {
                            memory.exportType = '*';
                            state = states.from;
                            saveVar();
                            break;
                        }

                        if ('let' === this.source.substr(i, 3) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1) {
                            memory.exportType = 'let';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('var' === this.source.substr(i, 3) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 3)) !== -1) {
                            memory.exportType = 'var';
                            i += 2;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('const' === this.source.substr(i, 5) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 5)) !== -1) {
                            memory.exportType = 'const';
                            i += 4;
                            state = states.lcv.anything;
                            break;
                        }

                        if ('function' === this.source.substr(i, 8) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 8)) !== -1) {
                            memory.exportType = 'function';
                            i += 7;
                            let j;
                            [j, curCommentIndex] = this.skipNonCode(i + 1);
                            if ('*'.charCodeAt(0) === this.source.charCodeAt(j)) {
                                i = j;
                                memory.exportType = 'function*';
                            }

                            state = states.fc.anything;
                            break;
                        }

                        if ('class' === this.source.substr(i, 5) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 5)) !== -1) {
                            memory.exportType = 'class';
                            i += 4;
                            state = states.fc.anything;
                            break;
                        }

                        if ('default' === this.source.substr(i, 7) && jsDelimiterChars.indexOf(this.source.charCodeAt(i + 7)) !== -1) {
                            memory.exportType = 'default';
                            state = states.end;
                            break;
                        }

                        break;

                    /**
                     * EXPORT TYPE Brackets
                     */
                    case states.brackets.anything:
                        memory.exportType = 'brackets';
                        i--;
                        state = states.brackets.var;
                        break;

                    case states.brackets.var:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (memory.nonCodeSkipped && 'a'.charCodeAt(0) === this.source.charCodeAt(i) && 's'.charCodeAt(0) === this.source.charCodeAt(i + 1)) {
                            i += 2;
                            state = states.brackets.label;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.from;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.brackets.label:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.from;
                            break;
                        }

                        memory.currLabel[memory.currLabelLength++] = currChar;
                        break;


                    /**
                     * EXPORT TYPE Let
                     * EXPORT TYPE Const
                     * EXPORT TYPE Var
                     */
                    case states.lcv.anything:
                        i -= 1;
                        state = states.lcv.var;
                        break;

                    case states.lcv.var:
                        if ('='.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.lcv.afterEqual;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.lcv.anything;
                            break;
                        }

                        if (';'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.end;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.lcv.afterEqual:
                        [i, curCommentIndex] = this.skipBrackets(i, curCommentIndex);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.lcv.anything;
                            break;
                        }

                        if (';'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.end;
                            break;
                        }

                        break;

                    /**
                     * EXPORT TYPE Function
                     */
                    case states.fc.anything:
                        i -= 1;
                        state = states.fc.var;
                        break;

                    case states.fc.var:
                        if (memory.nonCodeSkipped || '('.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.end;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * FROM
                     */
                    case states.from:
                        if (this.source.substr(i, 4) === 'from') {
                            i += 4;
                            const url = this._commentsAndStrings[nextString(i)];
                            memory.from = this.source.substring(url[0], url[1]);
                        }

                        state = states.end;
                        break;

                    /**
                     * Return results
                     */
                    case states.end:
                        return collectResults();
                }

                i++;
            }

            return collectResults();
        };

        const exports = {
            exportIndexes: [],
            exportBeginnings: [],
            names: [],
            labels: [],
            isBrackets: [],
            isLet: [],
            isVar: [],
            isConst: [],
            isClass: [],
            isFunction: [],
            isGeneratorFunction: [],
            isAll: [],
            from: []
        };

        for (let i = 0; i < exportBeginnings.length; i++) {
            curCommentIndex = NaN;
            let currExports = analyzeExport(exportBeginnings[i], i);
            for (let j in currExports) {
                exports[j] = exports[j].concat(currExports[j]);
            }
        }

        this.exports = exports;
    }

    findImports() {
        const rx = /(?:^|\s|\/|\)|\[|;|{|})(import)(?={|\s|\/)/gm;
        let match;
        const importBeginnings = [];
        while ((match = rx.exec(this.source))) {
            let curPos = match[0].indexOf('import') + match.index;
            if (this.isCommentOrString(curPos)) {
                continue;
            }
            importBeginnings.push(curPos);
        }

        let curCommentIndex = NaN;

        const analyzeImport = (i, exportIndex) => {
            i += 6;
            const importBeginning = i;

            const states = {
                start: 0,
                brackets: {
                    anything: 10,
                    var: 11,
                    as: 12,
                    label: 13
                },
                default: {
                    anything: 61,
                    var: 62
                },
                all: {
                    anything: 71,
                    var: 72
                },
                end: 100
            };

            const memory = {
                currVar: new Array(1000),
                currVarLength: 0,
                currLabel: new Array(1000),
                currLabelLength: 0,
                importType: '',
                nonCodeSkipped: false,
                from: null
            };

            const currImportsArr = {
                importIndexes: [],
                importBeginnings: [],
                names: [],
                labels: [],
                isBrackets: [],
                isDefault: [],
                isAll: [],
                from: [],
            };

            const saveVar = () => {
                const name = memory.currVar.join('');
                const label = memory.currLabelLength > 0 ? memory.currLabel.join('') : name;

                memory.currVar.fill(undefined);
                memory.currLabel.fill(undefined);
                memory.currVarLength = 0;
                memory.currLabelLength = 0;

                currImportsArr.importIndexes.push(exportIndex);
                currImportsArr.importBeginnings.push(importBeginning);
                currImportsArr.names.push(name);
                currImportsArr.labels.push(label || name);
                currImportsArr.isBrackets.push(memory.importType === 'brackets');
                currImportsArr.isDefault.push(memory.importType === 'default');
                currImportsArr.isAll.push(memory.importType === '*');
                currImportsArr.from.push(memory.from);
            };

            const collectResults = () => {
                if (memory.from)
                    for (let i = 0; i < currImportsArr.from.length; i++)
                        currImportsArr.from[i] = memory.from

                return currImportsArr;
            };

            let state = states.start;

            while (i < this.source.length) {
                let j;
                [j, curCommentIndex] = this.skipNonCode(i);
                memory.nonCodeSkipped = i !== j;
                i = j;

                const currChar = this.source.charAt(i);

                switch (state) {
                    /**
                     * Checks import type
                     */
                    case states.start:
                        if ('{'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.brackets.anything;
                            break;
                        }

                        if ('*'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            state = states.all.anything;
                            break;
                        }

                        if (this.source.substr(i, 4) === 'from') {
                            i += 4;
                            const url = this._commentsAndStrings[this.nextString(i)];
                            memory.from = this.source.substring(url[0], url[1]);
                            state = states.end;
                            break;
                        }

                        memory.importType = 'default';
                        state = states.default.anything;
                        break;

                    /**
                     * IMPORT TYPE Brackets
                     */
                    case states.brackets.anything:
                        memory.importType = 'brackets';
                        i--;
                        state = states.brackets.var;
                        break;

                    case states.brackets.var:
                        if (memory.nonCodeSkipped && 'a'.charCodeAt(0) === this.source.charCodeAt(i) && 's'.charCodeAt(0) === this.source.charCodeAt(i + 1)) {
                            i += 2;
                            state = states.brackets.label;
                            break;
                        }

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    case states.brackets.label:
                        [i, curCommentIndex] = this.skipNonCode(i);

                        if (','.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            i++;
                            state = states.brackets.anything;
                            break;
                        }

                        if ('}'.charCodeAt(0) === currChar.charCodeAt(0)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        memory.currLabel[memory.currLabelLength++] = currChar;
                        break;


                    /**
                     * IMPORT TYPE Default
                     */
                    case states.default.anything:
                        i -= 1;
                        state = states.default.var;
                        break;

                    case states.default.var:
                        if (jsDelimiterChars.indexOf(this.source.charCodeAt(i)) !== -1) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        if (memory.nonCodeSkipped) {
                            saveVar();
                            i -= 1;
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * IMPORT TYPE * as obj
                     */
                    case states.all.anything:
                        memory.exportType = '*';
                        [i, curCommentIndex] = this.skipNonCode(i);
                        if (this.source.substr(i, 2) === 'as') {
                            i += 2;
                            state = states.all.var;
                            break;
                        }

                        break;

                    case states.all.var:
                        if (','.charCodeAt(i) === currChar.charCodeAt(i)) {
                            saveVar();
                            state = states.start;
                            break;
                        }

                        if (memory.nonCodeSkipped) {
                            saveVar();
                            i -= 1;
                            state = states.start;
                            break;
                        }

                        memory.currVar[memory.currVarLength++] = currChar;
                        break;

                    /**
                     * Return results
                     */
                    case states.end:
                        return collectResults();
                }

                i++;
            }

            return collectResults();
        };

        const imports = {
            importIndexes: [],
            importBeginnings: [],
            names: [],
            labels: [],
            isBrackets: [],
            isDefault: [],
            isAll: [],
            from: [],
        };

        for (let i = 0; i < importBeginnings.length; i++) {
            curCommentIndex = NaN;
            let currExports = analyzeImport(importBeginnings[i], i);
            for (let j in currExports) {
                imports[j] = imports[j].concat(currExports[j]);
            }
        }

        this.imports = imports;
    }

    findScope(index, scopeType = StaticAnalyzer.scopeTypes.es6) {

        let opening = -1;
        let closing = -1;

        if (scopeType === StaticAnalyzer.scopeTypes.es6) {
            opening = binarySearchLowerBound(this._es6Scopes[0], index);
            closing = this._closingEs6ScopesSorted[1][binarySearchUpperBound(this._closingEs6ScopesSorted[0], index)];
        } else {
            opening = binarySearchLowerBound(this._es5Scopes[0], index);
            closing = this._closingEs5ScopesSorted[1][binarySearchUpperBound(this._closingEs5ScopesSorted[0], index)];
        }

        if (opening < 0 || closing < 0) {
            return 0;
        }

        if (scopeType === StaticAnalyzer.scopeTypes.es6) {
            return this._es6ScopeGraph.lca(opening, closing);
        }
        return this._es5ScopeMap[this._es5ScopeGraph.lca(opening, closing)];
    }

    analyzeFunctionParams() {
        this._functionParams = [];
        const n_scopes = this._scopeData.length;
        let i = 0;
        while (i < n_scopes) {
            const scope_data = this._scopeData[i];
            if (scope_data[1]) {
                this._functionParams.push(scope_data[1])
            }
            i++;
        }
    }

    isFunctionParam(index) {
        if (!this._functionParams) {
            this.analyzeFunctionParams();
        }

        return binarySearch(this._functionParams, index) !== -1;
    };

    findReferences(variable) {
        const rx = new RegExp('(?:^|\\s|=|\\+|\\-|\\/|\\*|\\%|\\(|\\)|\\[|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)('
            + variable
            + ')(?=\\s|$|=|\\+|\\.|\\-|\\/|\\*|\\%|\\(|\\)|\\[|\\]|;|:|{|}|\\n|\\r|,|!|&|\\||\\^|\\?|>|<)', 'gm');
        let match;
        const matches = [];

        // might be a bug if there is a = somethingsomethingfunction* x, we will mistake this for a definition
        // probably need to check the other side too
        const declarationTypes = ['var', 'let', 'const', 'class', 'function', 'function*'];
        const isMultivariable = [true, true, true, false, false, false];

        const getDeclarationType = (index, scope = this.findScope(index)) => {
            const originalIndex = index;
            if (this.isFunctionParam(index)) {
                return 'param';
            }

            const scopeStart = scope === -1 ? 0 : this._es6Scopes[0][scope];
            index = this.skipNonCodeNEW(index - 1, cOBJ, -1);

            // multivariable case
            if (this.source.charCodeAt(index) === ','.charCodeAt(0)) {
                let beforeNewLine = false;

                while (index > scopeStart) {
                    index = this.skipNonCodeAndScopes(index, cOBJ, -1, true, true, false);
                    const currCharCode = this.source.charCodeAt(index);

                    if (currCharCode === ';'.charCodeAt(0)) {
                        return null;
                    }

                    if (beforeNewLine) {
                        // todo: eval check
                    }

                    beforeNewLine = currCharCode === 10; // newline symbol
                    index--;
                }

                console.log(originalIndex, index, index === scopeStart, this.source.substr(index, 5));
                if (index === scopeStart) {
                    return null;
                }
            }

            let i = 0;
            let curLength = 0;
            const len = declarationTypes.length;
            let cur = '';

            while (i < len) {
                if (curLength !== declarationTypes[i].length) {
                    curLength = declarationTypes[i].length;
                    cur = this.source.substr(index - curLength + 1, curLength);
                }

                if (cur === declarationTypes[i]) {
                    return cur;
                }

                i++;
            }
            return null;
        };

        const references = [];
        const scopes = [];
        const isDec = [];
        const decType = [];
        const declarationScopes = new Set();

        while ((match = rx.exec(this.source))) {
            const index = match[0].indexOf(variable) + match.index;
            if (!this.isCommentOrString(index)) {
                const scope = this.findScope(index);
                const declaraionType = getDeclarationType(index, scope);
                scopes.push(scope);
                isDec.push(declaraionType !== null);
                decType.push(declaraionType);

                if (declaraionType) {
                    declarationScopes.add(scope);
                }

                references.push(index);
            }
        }

        for (let i = 0; i < references.length; i++) {
            // todo: get all updated references
        }

        console.table(reshapeObject({references, scopes, isDec, decType}));
    }


    // helper functions

    visualizeCode(container) {
        const spacePlaceHolder = String.fromCharCode(1000);
        const newLinePlaceHolder = String.fromCharCode(1001);

        const cur = this.source.replace(/\n/g, newLinePlaceHolder).replace(/\s/g, spacePlaceHolder);
        let res = '';
        const scopes = [...this._es6Scopes[0], ...this._es6Scopes[1]];

        for (let i = 0; i < cur.length; i++) {
            let c = cur.charAt(i).replace('<', "&lt;").replace('>', "&gt;");

            if (this.isCommentOrString(i)) {
                c = `<u><b>${c}</b></u>`;
            }

            if (scopes.indexOf(i) !== -1) {
                if (c === spacePlaceHolder || c === newLinePlaceHolder) {
                    c += `<span style="background-color: #ff0000; color: #fff">&nbsp</span>`;
                } else {
                    c = `<span style="background-color: #ff0000; color: #fff">${c}</span>`;
                }

            }

            res += c;

        }

        container.innerHTML = res.replace(new RegExp(newLinePlaceHolder, 'g'), '<br>').replace(new RegExp(spacePlaceHolder, 'g'), '&nbsp;');
    }

    visualizeExports() {
        console.table(reshapeObject(this.imports))
    }

    visualizeImports() {
        console.table(reshapeObject(this.imports))
    }

    printBrokenScopes() {
        const res = [];
        for (let i = 0; i < this._es6Scopes[0].length; i++)
            if (isNaN(this._es6Scopes[1][i]))
                res.push(this._es6Scopes[0][i]);
        for (let i in res) {
            console.log(this.source.substr(res[i], 100));
        }
    }

    printFunctionArguments() {
        const res = this._scopeData.filter(x => x[0] && (x[0] === StaticAnalyzer.scopeTypes.function || x[0] & StaticAnalyzer.scopeTypes.arrowFunction));
        const arrRes = [];
        for (let i in res) {
            if (!isNaN(res[i][1][0]) && !isNaN(res[i][1][1])) {
                arrRes.push(this.source.substring(res[i][1][0], res[i][1][1]));
            }

            // console.log(res[i][1][0], res[i][1][1]);
        }
        return arrRes.join('\n');
    }

}

const reshapeObject = (object) => {
    const len = object[Object.keys(object)[0]].length;
    const ret = [];
    for (let i = 0; i < len; i++) {
        let col = {};
        for (let key in object) {
            col[key] = object[key][i]
        }
        ret.push(col)
    }
    return ret;
};

StaticAnalyzer.scopeTypes = {
    es5: 0b00000000000,
    es6: 0b10000000000,
    singleStatement: 0b00100000000,
    expression: 0b00010000000,
    destruction: 0b11000000000,
    function: 0b00000000010,
    arrowFunction: 0b00000000100,
    for: 0b10000001000,
    if: 0b10000010000,
    while: 0b10000100000,
    do: 0b10001000000,
    class: 0b10010000000
};

StaticAnalyzer.globalScopeBracket = 11116666;