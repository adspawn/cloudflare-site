export default {
    async fetch(request, env, ctx) {
        // バーコードバトラーIIのHTML（詳細バージョン）
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>バーコードバトラーII 完全再現シミュレーター</title>
    <style>
        body { font-family: sans-serif; background: #eef; padding: 20px; max-width: 900px; margin: 0 auto; }
        h1 { text-align: center; color: #333; }
        form { max-width: 800px; margin: 0 auto 20px; background: #fff; padding: 20px; 
              border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); }
        label, input, button { display: block; width: 100%; margin-bottom: 15px; }
        input { font-size: 18px; padding: 10px; }
        button { font-size: 18px; padding: 10px; border: none; border-radius: 4px; 
                cursor: pointer; background: #007acc; color: #fff; }
        button:hover { background: #005fa3; }
        .reset-btn { background: #d9534f; }
        .reset-btn:hover { background: #c9302c; }
        .result { max-width: 800px; margin: 0 auto; background: #fff; padding: 15px; 
                 border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); 
                 white-space: pre-wrap; font-family: monospace; line-height: 1.5; }
        .character-info { border: 1px solid #ddd; padding: 15px; margin-top: 10px; border-radius: 4px; }
        .param-name { font-weight: bold; display: inline-block; width: 150px; }
        .special-ability { margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px; }
        .section-title { font-weight: bold; margin: 15px 0 5px; font-size: 1.1em; color: #007acc; }
        .hidden { display: none; }
        .tab-buttons { display: flex; margin-bottom: 10px; }
        .tab-button { flex: 1; padding: 10px; background: #eee; border: none; cursor: pointer; }
        .tab-button.active { background: #007acc; color: white; }
        .explanation { margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>バーコードバトラーII 完全再現シミュレーター</h1>
    <form id="barcodeForm">
        <label for="barcodeInput">バーコードを入力（8桁または13桁）:</label>
        <input type="text" id="barcodeInput" placeholder="例: 4901234567890" required>
        <button type="submit">召喚</button>
        <button type="button" id="resetButton" class="reset-btn">リセット</button>
    </form>
    <div class="result" id="result"></div>
    
    <script>
        // バーコードの分類を判定する関数
        function classifyBarcode(code) {
            // 8桁の場合は後読み8桁バーコード
            if (code.length === 8) {
                return {
                    type: '後読み8桁バーコード',
                    readingDirection: 'backward',
                    length: 8
                };
            }
            
            // 13桁の場合、さらに分類
            const firstDigit = parseInt(code[0]);
            const digit8 = parseInt(code[7]);
            const digit3 = parseInt(code[2]);
            const digit10 = parseInt(code[9]);
            const digit4and5 = parseInt(code.substring(3, 5));
            const digit6and7 = parseInt(code.substring(5, 7));
            
            if (firstDigit <= 1) {
                if (digit8 <= 4 || digit8 === 9) {
                    return {
                        type: '前読み13桁バーコード(通常)',
                        readingDirection: 'forward',
                        length: 13,
                        special: false
                    };
                } else if (digit8 === 5 || digit8 === 6) {
                    if (digit4and5 <= 19) {
                        return {
                            type: '前読み13桁バーコード(通常)',
                            readingDirection: 'forward',
                            length: 13,
                            special: false
                        };
                    } else {
                        return {
                            type: '後読み13桁バーコード',
                            readingDirection: 'backward',
                            length: 13
                        };
                    }
                } else if (digit8 === 7 || digit8 === 8) {
                    if (digit6and7 <= 19) {
                        return {
                            type: '前読み13桁バーコード(通常)',
                            readingDirection: 'forward',
                            length: 13,
                            special: false
                        };
                    } else {
                        return {
                            type: '後読み13桁バーコード',
                            readingDirection: 'backward',
                            length: 13
                        };
                    }
                }
            } else if (firstDigit >= 2 && firstDigit <= 9) {
                if (digit3 === 9 && digit10 === 5) {
                    return {
                        type: '前読み13桁バーコード(特殊)',
                        readingDirection: 'forward',
                        length: 13,
                        special: true
                    };
                } else {
                    return {
                        type: '後読み13桁バーコード',
                        readingDirection: 'backward',
                        length: 13
                    };
                }
            }
            
            // デフォルトは後読み13桁バーコード
            return {
                type: '後読み13桁バーコード',
                readingDirection: 'backward',
                length: 13
            };
        }
        
        // バーコードがキャラクターかアイテムかを判定する関数
        function determineEntityType(code, barcodeType) {
            let lastDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は8桁目で判定
                lastDigit = parseInt(code[7]);
            } else {
                // 後読みバーコードの場合は最後の桁で判定
                lastDigit = parseInt(code[code.length - 1]);
            }
            
            return lastDigit <= 4 ? 'character' : 'item';
        }
        
        // キャラクターの種族を判定する関数
        function determineRace(code, barcodeType) {
            let raceDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は8桁目で判定
                raceDigit = parseInt(code[7]);
            } else {
                // 後読みバーコードの場合は最後の桁で判定
                raceDigit = parseInt(code[code.length - 1]);
            }
            
            const races = ['メカ族', 'アニマル族', 'オーシャン族', 'バード族', 'ヒューマン族'];
            return races[raceDigit];
        }
        
        // キャラクターの職業を判定する関数
        function determineJob(code, barcodeType) {
            let jobDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は9桁目で判定
                jobDigit = parseInt(code[8]);
            } else if (barcodeType.length === 8) {
                // 後読み8桁バーコードの場合は1桁目で判定
                jobDigit = parseInt(code[0]);
            } else {
                // 後読み13桁バーコードの場合は6桁目で判定
                jobDigit = parseInt(code[5]);
            }
            
            return jobDigit <= 6 ? '戦士' : '魔法使い';
        }
        
        // アイテムの種別を判定する関数
        function determineItemType(code, barcodeType) {
            let typeDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は8桁目で判定
                typeDigit = parseInt(code[7]);
            } else {
                // 後読みバーコードの場合は最後の桁で判定
                typeDigit = parseInt(code[code.length - 1]);
            }
            
            const types = {
                5: '武器・使い捨て',
                6: '武器',
                7: '防具・使い捨て',
                8: '防具',
                9: 'HPアップ'
            };
            
            // 前読みの場合、9はサブタイプが必要
            if (barcodeType.readingDirection === 'forward' && typeDigit === 9) {
                const subTypeDigit = parseInt(code[8]);
                if (subTypeDigit <= 4) return 'HPアイテム';
                if (subTypeDigit <= 6) return '情報アイテム';
                if (subTypeDigit === 7) return 'PPアイテム';
                return 'MPアイテム';
            }
            
            return types[typeDigit] || '不明';
        }
        
        // アイテムの種類を判定する関数
        function determineItemKind(code, barcodeType) {
            let kindDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は9桁目で判定
                kindDigit = parseInt(code[8]);
                return kindDigit;
            } else {
                // 後読みバーコードの場合は常に0
                return 0;
            }
        }
        
        // 特殊能力を判定する関数
        function determineSpecialAbility(code, barcodeType) {
            let tensDigit, onesDigit;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合は11, 12桁目で判定
                tensDigit = parseInt(code[10]);
                onesDigit = parseInt(code[11]);
            } else if (barcodeType.length === 8) {
                // 後読み8桁バーコードの場合
                tensDigit = Math.floor(parseInt(code[3]) / 4);
                onesDigit = parseInt(code[5]);
            } else {
                // 後読み13桁バーコードの場合
                tensDigit = Math.floor(parseInt(code[8]) / 4);
                onesDigit = parseInt(code[10]);
            }
            
            const abilityCode = tensDigit * 10 + onesDigit;
            return getSpecialAbilityDescription(abilityCode);
        }
        
        // 特殊能力の詳細説明を取得する関数
        function getSpecialAbilityDescription(abilityCode) {
            const abilities = {
                0: '特殊能力なし',
                1: '職業「1」の相手に対して3倍剣',
                2: '職業「2」の相手に対して3倍剣',
                3: '職業「3」の相手に対して3倍剣',
                4: '職業「4」の相手に対して3倍剣',
                5: '職業「5」の相手に対して3倍剣',
                6: '職業「6」の相手に対して3倍剣',
                7: '職業「7」の相手に対して3倍剣',
                8: '職業「8」の相手に対して3倍剣',
                9: '職業「9」の相手に対して3倍剣',
                10: '職業「0」の相手に対して3倍剣',
                11: '種族「1」(アニマル族)の相手に対して3倍剣',
                12: '種族「2」(オーシャン族)の相手に対して3倍剣',
                13: '種族「3」(バード族)の相手に対して3倍剣',
                14: '種族「4」(ヒューマン族)の相手に対して3倍剣',
                15: '種族「0」(メカ族)の相手に対して3倍剣',
                16: '自分の破壊力50％ダウン(0.5倍剣)',
                17: '自分の破壊力50％アップ(1.5倍剣)',
                18: '自分の破壊力100％アップ(2倍剣)',
                19: '主人公フラグ(C1/C2モードで主人公として使える)',
                20: '自分の防御力10％アップ(0.9倍盾)',
                21: '自分の防御力30％アップ(0.7倍盾)',
                22: '自分の防御力50％アップ(0.5倍盾)',
                23: '相手のST30％ダウン',
                24: '相手のST50％ダウン',
                25: '相手のDF30％ダウン',
                26: '相手のDF50％ダウン',
                27: '相手のDF80％ダウン',
                28: '相手のHP30％ダウン',
                29: '相手のHP50％ダウン'
            };
            
            // 30以上の場合は一般的な表現を使用
            if (abilityCode >= 30) {
                return '特殊能力コード: ' + abilityCode;
            }
            
            return (abilities[abilityCode] || '不明') + ' (コード: ' + abilityCode + ')';
        }
        
        // HP (生命力) を計算する関数
        function calculateHP(code, barcodeType) {
            let tenThousands, thousands, hundreds;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合
                tenThousands = parseInt(code[0]);
                thousands = parseInt(code[1]);
                hundreds = parseInt(code[2]);
                
                // 特殊バーコードの場合は20900以上
                if (barcodeType.special) {
                    return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
                }
                
                return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
            } else if (barcodeType.length === 8) {
                // 後読み8桁バーコードの場合
                tenThousands = Math.floor(parseInt(code[6]) / 2);
                thousands = parseInt(code[5]);
                hundreds = parseInt(code[4]);
                
                return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
            } else {
                // 後読み13桁バーコードの場合
                tenThousands = Math.floor(parseInt(code[11]) / 2);
                thousands = parseInt(code[10]);
                hundreds = parseInt(code[9]);
                
                return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
            }
        }
        
        // ST (攻撃力) を計算する関数
        function calculateST(code, barcodeType) {
            let tenThousands, thousands, hundreds;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合
                if (barcodeType.special) {
                    // 特殊バーコード
                    const digit8 = parseInt(code[7]);
                    const digit4and5 = parseInt(code.substring(3, 5));
                    
                    if (digit8 === 0 || digit8 === 2) {
                        tenThousands = 1;
                    } else if (digit8 === 1) {
                        // 特殊条件をチェック
                        const specialValues = [14, 30, 46, 62, 78, 94];
                        const digit6and7 = parseInt(code.substring(5, 7));
                        if (specialValues.includes(digit6and7)) {
                            tenThousands = 1;
                        } else {
                            tenThousands = 0;
                        }
                    } else {
                        tenThousands = 0;
                    }
                } else {
                    // 通常の前読みバーコード
                    tenThousands = 0;
                }
                
                thousands = parseInt(code[3]);
                hundreds = parseInt(code[4]);
            } else if (barcodeType.length === 8) {
                const digit6 = parseInt(code[5]);
                if ([5, 6, 7, 8].includes(digit6)) {
                    thousands = 1;
                } else if ([9, 0, 1, 2].includes(digit6)) {
                    thousands = 2;
                } else {
                    thousands = 3;
                }
                
                hundreds = (parseInt(code[4]) + 5) % 10;
            } else {
                const digit11 = parseInt(code[10]);
                if ([5, 6, 7, 8].includes(digit11)) {
                    thousands = 1;
                } else if ([9, 0, 1, 2].includes(digit11)) {
                    thousands = 2;
                } else {
                    thousands = 3;
                }
                
                hundreds = (parseInt(code[9]) + 5) % 10;
            }
            
            return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
        }
        
        // DF (守備力) を計算する関数
        function calculateDF(code, barcodeType) {
            let tenThousands, thousands, hundreds;
            
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合
                if (barcodeType.special) {
                    // 特殊バーコード
                    const digit8 = parseInt(code[7]);
                    const digit4and5 = parseInt(code.substring(3, 5));
                    
                    if (digit8 === 1 || digit8 === 2) {
                        tenThousands = 1;
                    } else if (digit8 === 0) {
                        // 特殊条件をチェック
                        const specialValues = [13, 29, 45, 61, 77, 93, 14, 30, 46, 62, 78, 94];
                        if (specialValues.includes(digit4and5)) {
                            tenThousands = 1;
                        } else {
                            tenThousands = 0;
                        }
                    } else {
                        tenThousands = 0;
                    }
                } else {
                    // 通常の前読みバーコード
                    tenThousands = 0;
                }
                
                thousands = parseInt(code[5]);
                hundreds = parseInt(code[6]);
            } else if (barcodeType.length === 8) {
                // 後読み8桁バーコードの場合
                tenThousands = 0;
                thousands = (parseInt(code[4]) + 7) % 10;
                hundreds = (parseInt(code[3]) + 7) % 10;
            } else {
                // 後読み13桁バーコードの場合
                tenThousands = 0;
                thousands = (parseInt(code[9]) + 7) % 10;
                hundreds = (parseInt(code[8]) + 7) % 10;
            }
            
            return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
        }
        
        // DX (素早さ) を計算する関数
        function calculateDX(code, barcodeType) {
            if (barcodeType.readingDirection === 'forward') {
                // 前読みバーコードの場合
                if (barcodeType.special) {
                    return 5; // 特殊バーコードは常に5
                }
                return parseInt(code[9]);
            } else if (barcodeType.length === 8) {
                // 後読み8桁バーコードの場合
                return parseInt(code[5]);
            } else {
                // 後読み13桁バーコードの場合
                return parseInt(code[10]);
            }
        }
        
        // アイテムの上昇値を計算する関数
        function calculateItemValue(code, barcodeType, itemType) {
            let tenThousands = 0, thousands = 0, hundreds = 0;
            
            if (itemType.includes('武器')) {
                if (barcodeType.readingDirection === 'forward') {
                    thousands = parseInt(code[3]);
                    hundreds = parseInt(code[4]);
                } else if (barcodeType.length === 8) {
                    const digit6 = parseInt(code[5]);
                    if ([5,6,7,8].includes(digit6)) thousands = 1;
                    else if ([9,0,1,2].includes(digit6)) thousands = 2;
                    else thousands = 3;
                    
                    hundreds = (parseInt(code[4]) + 5) % 10;
                } else {
                    const digit11 = parseInt(code[10]);
                    if ([5,6,7,8].includes(digit11)) thousands = 1;
                    else if ([9,0,1,2].includes(digit11)) thousands = 2;
                    else thousands = 3;
                    
                    hundreds = (parseInt(code[9]) + 5) % 10;
                }
            } else if (itemType.includes('防具')) {
                if (barcodeType.readingDirection === 'forward') {
                    thousands = parseInt(code[5]);
                    hundreds = parseInt(code[6]);
                } else if (barcodeType.length === 8) {
                    const digit5 = parseInt(code[4]);
                    if ([3,4,5,6].includes(digit5)) thousands = 0;
                    else if ([7,8,9,0].includes(digit5)) thousands = 1;
                    else thousands = 2;
                    
                    hundreds = (parseInt(code[3]) + 7) % 10;
                } else {
                    const digit10 = parseInt(code[9]);
                    if ([3,4,5,6].includes(digit10)) thousands = 0;
                    else if ([7,8,9,0].includes(digit10)) thousands = 1;
                    else thousands = 2;
                    
                    hundreds = (parseInt(code[8]) + 7) % 10;
                }
            } else if (itemType === 'HPアップ' || itemType === 'HPアイテム') {
                if (barcodeType.readingDirection === 'forward') {
                    if (barcodeType.special) {
                        tenThousands = parseInt(code[0]);
                        thousands = parseInt(code[1]);
                        hundreds = parseInt(code[2]);
                    } else {
                        tenThousands = parseInt(code[0]);
                        thousands = parseInt(code[1]);
                        hundreds = parseInt(code[2]);
                    }
                } else if (barcodeType.length === 8) {
                    tenThousands = Math.floor(parseInt(code[6]) / 8);
                    thousands = parseInt(code[5]);
                    hundreds = parseInt(code[4]);
                } else {
                    tenThousands = Math.floor(parseInt(code[11]) / 8);
                    thousands = parseInt(code[10]);
                    hundreds = parseInt(code[9]);
                }
            } else if (itemType === 'PPアイテム') {
                if (barcodeType.readingDirection === 'forward') {
                    if (barcodeType.special) {
                        return parseInt(code[3]) * 10 + parseInt(code[4]);
                    } else {
                        return parseInt(code[3]) * 10 + parseInt(code[4]);
                    }
                }
            } else if (itemType === 'MPアイテム') {
                if (barcodeType.readingDirection === 'forward') {
                    if (barcodeType.special) {
                        return parseInt(code[5]) * 10 + parseInt(code[6]);
                    } else {
                        return parseInt(code[5]) * 10 + parseInt(code[6]);
                    }
                }
            }
            
            return (tenThousands * 10000 + thousands * 1000 + hundreds * 100);
        }
        
        // バーコードを解析する関数
        function analyzeBarcode(code) {
            // バーコードの分類
            const barcodeType = classifyBarcode(code);
            
            // キャラクターかアイテムかを判定
            const entityType = determineEntityType(code, barcodeType);
            
            // 結果オブジェクトを初期化
            const result = {
                barcode: code,
                barcodeType: barcodeType,
                entityType: entityType
            };
            
            // キャラクターの場合
            if (entityType === 'character') {
                result.race = determineRace(code, barcodeType);
                result.job = determineJob(code, barcodeType);
                result.hp = calculateHP(code, barcodeType);
                result.st = calculateST(code, barcodeType);
                result.df = calculateDF(code, barcodeType);
                result.dx = calculateDX(code, barcodeType);
                result.specialAbility = determineSpecialAbility(code, barcodeType);
            } 
            // アイテムの場合
            else {
                result.itemType = determineItemType(code, barcodeType);
                result.itemKind = determineItemKind(code, barcodeType);
                result.itemValue = calculateItemValue(code, barcodeType, result.itemType);
                result.specialAbility = determineSpecialAbility(code, barcodeType);
            }
            
            return result;
        }
        
        // 解析結果を表示する関数
        function displayResult(result) {
            let output = '';
            
            // バーコード情報
            output += 'バーコード: ' + result.barcode + '\n';
            output += '種別: ' + result.barcodeType.type + '\n\n';
            
            // キャラクターの場合
            if (result.entityType === 'character') {
                output += '【キャラクター情報】\n';
                output += '種族: ' + result.race + '\n';
                output += '職業: ' + result.job + '\n\n';
                
                output += '【パラメータ】\n';
                output += 'HP (生命力): ' + result.hp + '\n';
                output += 'ST (攻撃力): ' + result.st + '\n';
                output += 'DF (守備力): ' + result.df + '\n';
                output += 'DX (素早さ): ' + result.dx + '（画面上には表示されません）\n\n';
                
                output += '【特殊能力】\n';
                output += result.specialAbility + '\n';
                
                // 魔法使いの場合、利用可能な魔法を表示
                if (result.job === '魔法使い') {
                    output += '\n【使用可能な魔法】\n';
                    output += 'F0魔法「トルマ」: 相手のMPを奪う\n';
                    output += 'F1魔法「ガンツ」: 攻撃の1.5倍のダメージ\n';
                    output += 'F2魔法「デカンツ」: 攻撃の2倍のダメージ\n';
                    output += 'F3魔法「リーモ」: HPを30％回復\n';
                    output += 'F4魔法「デリーモ」: HPを50％回復\n';
                    output += 'F5魔法「ニャーヘ」: 相手のDFを30％ダウン\n';
                    output += 'F6魔法「カチコム」: 自分のDFを30％アップ\n';
                    output += 'F7魔法「ヘヘンダ」: 相手のSTを30％ダウン\n';
                    output += 'F8魔法「タフニ」: 自分のSTを30％アップ\n';
                    output += 'F9魔法「マミロージャ」: 相手の回復を禁止\n';
                }
            } 
            // アイテムの場合
            else {
                output += '【アイテム情報】\n';
                output += '種別: ' + result.itemType + '\n';
                output += '種類: ' + result.itemKind + '\n\n';
                
                output += '【効果】\n';
                if (result.itemType.includes('武器')) {
                    output += 'ST (攻撃力) 上昇値: +' + result.itemValue + '\n';
                } else if (result.itemType.includes('防具')) {
                    output += 'DF (守備力) 上昇値: +' + result.itemValue + '\n';
                } else if (result.itemType === 'HPアップ' || result.itemType === 'HPアイテム') {
                    output += 'HP (生命力) 上昇値: +' + result.itemValue + '\n';
                } else if (result.itemType === 'PPアイテム') {
                    output += 'PP (薬草) 上昇値: +' + result.itemValue + '\n';
                } else if (result.itemType === 'MPアイテム') {
                    output += 'MP (魔力) 上昇値: +' + result.itemValue + '\n';
                } else if (result.itemType === '情報アイテム') {
                    output += 'C1モードでのみ効果を発揮します\n';
                }
                
                output += '\n【特殊能力】\n';
                output += result.specialAbility + '\n';
            }
            
            return output;
        }
        
        // フォームの送信イベントを処理
        document.getElementById('barcodeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('barcodeInput').value.trim();
            
            // バーコードの検証
            if (!/^\d{8}$|^\d{13}$/.test(code)) {
                document.getElementById('result').textContent = 'バーコードは8桁または13桁の数字を入力してください。';
                return;
            }
            
            try {
                // バーコードを解析
                const analysisResult = analyzeBarcode(code);
                
                // 結果を表示
                document.getElementById('result').textContent = displayResult(analysisResult);
            } catch (error) {
                document.getElementById('result').textContent = 'エラーが発生しました: ' + error.message;
                console.error(error);
            }
        });
        
        // リセットボタン
        document.getElementById('resetButton').addEventListener('click', function() {
            document.getElementById('barcodeInput').value = '';
            document.getElementById('result').textContent = '';
        });
    </script>
</body>
</html>`;

        // HTML応答を返す
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'max-age=3600'
            }
        });
    }
}; 