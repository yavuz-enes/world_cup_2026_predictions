// ========================================================================
// 🌐 GLOBAL HEATMAP (FIREBASE VERİTABANI BAĞLANTISI)
// ========================================================================
// BURAYA KENDİ KOPYALADIĞIN firebaseConfig BİLGİLERİNİ YAPIŞTIR:
const firebaseConfig = {
  apiKey: "AIzaSyA8qjnNRjuTHgyM1uLFhHVEYOixdN57bBk",
  authDomain: "world-cup-2026-prediction.firebaseapp.com",
  databaseURL: "https://world-cup-2026-prediction-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "world-cup-2026-prediction",
  storageBucket: "world-cup-2026-prediction.firebasestorage.app",
  messagingSenderId: "753709446647",
  appId: "1:753709446647:web:f6e03d4f7edcbc339eeaf2",
  measurementId: "G-B30ZLX9LN1"
};

// Firebase'i Başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// YENİ: İlk 4'ü veritabanına kaydetme fonksiyonu (Kimlik kodları yerine gerçek İsimleri yollar)
window.saveGlobalStats = function(t1Id, t2Id, t3Id, t4Id) {
    const getTName = (id) => getTeamData(id).name;
    const n1 = getTName(t1Id), n2 = getTName(t2Id), n3 = getTName(t3Id), n4 = getTName(t4Id);

    console.log("📊 Veritabanına gönderiliyor:", {n1, n2, n3, n4}); // Takip için

    const updatePos = (name, pos) => {
        if (!name || name.startsWith('Bekleniyor') || name === 'Bay Geçer') return;
        
        db.ref('global_stats/' + name + '/' + pos).transaction(count => {
            return (count || 0) + 1;
        }, (error, committed, snapshot) => {
            if (error) console.error("❌ Kayıt hatası:", error);
            else if (committed) console.log(`✅ ${name} için ${pos} başarıyla güncellendi.`);
        });
    };

    updatePos(n1, 'gold');
    updatePos(n2, 'silver');
    updatePos(n3, 'bronze');
    updatePos(n4, 'fourth');
};

// ========================================================================
// 👥 CANLI KULLANICI SAYACI (PRESENCE)
// ========================================================================
const onlineRef = db.ref('online_users');
const myUserRef = onlineRef.push(); // Bu tarayıcı için eşsiz bir anahtar açar

// Bağlantı durumunu kontrol et
db.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        // Bağlandığımızda veritabanına "buradayım" de
        myUserRef.set(true);
        // Sekme kapandığında veya internet koptuğunda bu veriyi SİL
        myUserRef.onDisconnect().remove();
    }
});

// Toplam sayıyı dinle ve ekrana yaz (+12 hilesiyle!)
onlineRef.on('value', (snapshot) => {
    const realCount = snapshot.numChildren(); 
    const fakeCount = realCount + 6; // İstediğin 12 kişilik bonus
    
    const counterText = document.getElementById('online-count');
    if (counterText) {
        counterText.innerText = `${fakeCount} kişi şuan tahmin yapıyor`;
    }
});

// ========================================================================
// 🌍 1. TAKIMLARI VE BAYRAKLARI BURAYA EKLEYİN
// ========================================================================
const CUSTOM_TEAMS = {
    // --- A GRUBU ---
    "A1": { name: "Meksika", flag: "https://flagcdn.com/w40/mx.png" },
    "A2": { name: "Güney Afrika", flag: "https://flagcdn.com/w40/za.png" },
    "A3": { name: "Güney Kore", flag: "https://flagcdn.com/w40/kr.png" },
    // A4 Play-off'tan gelecek

    // --- B GRUBU ---
    "B1": { name: "Kanada", flag: "https://flagcdn.com/w40/ca.png" },
    "B2": { name: "Katar", flag: "https://flagcdn.com/w40/qa.png" },
    "B3": { name: "İsviçre", flag: "https://flagcdn.com/w40/ch.png" },
    // B4 Play-off'tan gelecek

    // --- C GRUBU ---
    "C1": { name: "Brezilya", flag: "https://flagcdn.com/w40/br.png" },
    "C2": { name: "Fas", flag: "https://flagcdn.com/w40/ma.png" },
    "C3": { name: "Haiti", flag: "https://flagcdn.com/w40/ht.png" },
    "C4": { name: "İskoçya", flag: "https://flagcdn.com/w40/gb-sct.png" },

    // --- D GRUBU ---
    "D1": { name: "ABD", flag: "https://flagcdn.com/w40/us.png" },
    "D2": { name: "Paraguay", flag: "https://flagcdn.com/w40/py.png" },
    "D3": { name: "Avustralya", flag: "https://flagcdn.com/w40/au.png" },
    // D4 Play-off'tan gelecek

    // --- E GRUBU ---
    "E1": { name: "Almanya", flag: "https://flagcdn.com/w40/de.png" },
    "E2": { name: "Curaçao", flag: "https://flagcdn.com/w40/cw.png" },
    "E3": { name: "Fildişi Sahili", flag: "https://flagcdn.com/w40/ci.png" },
    "E4": { name: "Ekvador", flag: "https://flagcdn.com/w40/ec.png" },

    // --- F GRUBU ---
    "F1": { name: "Hollanda", flag: "https://flagcdn.com/w40/nl.png" },
    "F2": { name: "Japonya", flag: "https://flagcdn.com/w40/jp.png" },
    "F3": { name: "Tunus", flag: "https://flagcdn.com/w40/tn.png" },
    // F4 Play-off'tan gelecek

    // --- G GRUBU ---
    "G1": { name: "Belçika", flag: "https://flagcdn.com/w40/be.png" },
    "G2": { name: "Mısır", flag: "https://flagcdn.com/w40/eg.png" },
    "G3": { name: "İran", flag: "https://flagcdn.com/w40/ir.png" },
    "G4": { name: "Yeni Zelanda", flag: "https://flagcdn.com/w40/nz.png" },

    // --- H GRUBU ---
    "H1": { name: "İspanya", flag: "https://flagcdn.com/w40/es.png" },
    "H2": { name: "Yeşil Burun Adaları", flag: "https://flagcdn.com/w40/cv.png" },
    "H3": { name: "Suudi Arabistan", flag: "https://flagcdn.com/w40/sa.png" },
    "H4": { name: "Uruguay", flag: "https://flagcdn.com/w40/uy.png" },

    // --- I GRUBU ---
    "I1": { name: "Fransa", flag: "https://flagcdn.com/w40/fr.png" },
    "I2": { name: "Senegal", flag: "https://flagcdn.com/w40/sn.png" },
    "I3": { name: "Norveç", flag: "https://flagcdn.com/w40/no.png" },
    // I4 Play-off'tan gelecek

    // --- J GRUBU ---
    "J1": { name: "Arjantin", flag: "https://flagcdn.com/w40/ar.png" },
    "J2": { name: "Cezayir", flag: "https://flagcdn.com/w40/dz.png" },
    "J3": { name: "Avusturya", flag: "https://flagcdn.com/w40/at.png" },
    "J4": { name: "Ürdün", flag: "https://flagcdn.com/w40/jo.png" },

    // --- K GRUBU ---
    "K1": { name: "Portekiz", flag: "https://flagcdn.com/w40/pt.png" },
    "K2": { name: "Özbekistan", flag: "https://flagcdn.com/w40/uz.png" },
    "K3": { name: "Kolombiya", flag: "https://flagcdn.com/w40/co.png" },
    // K4 Play-off'tan gelecek

    // --- L GRUBU ---
    "L1": { name: "İngiltere", flag: "https://flagcdn.com/w40/gb-eng.png" },
    "L2": { name: "Hırvatistan", flag: "https://flagcdn.com/w40/hr.png" },
    "L3": { name: "Gana", flag: "https://flagcdn.com/w40/gh.png" },
    "L4": { name: "Panama", flag: "https://flagcdn.com/w40/pa.png" },

// --- PLAY-OFF YOL 1 (Hedef: A Grubu) ---
    "PO1_T1": { name: "Çekya", flag: "https://flagcdn.com/w40/cz.png" },
    "PO1_T2": { name: "İrlanda", flag: "https://flagcdn.com/w40/ie.png" },
    "PO1_T3": { name: "Danimarka", flag: "https://flagcdn.com/w40/dk.png" },
    "PO1_T4": { name: "Kuzey Makedonya", flag: "https://flagcdn.com/w40/mk.png" },

    // --- PLAY-OFF YOL 2 (Hedef: B Grubu) ---
    "PO2_T1": { name: "Galler", flag: "https://flagcdn.com/w40/gb-wls.png" },
    "PO2_T2": { name: "Bosna-Hersek", flag: "https://flagcdn.com/w40/ba.png" },
    "PO2_T3": { name: "İtalya", flag: "https://flagcdn.com/w40/it.png" },
    "PO2_T4": { name: "Kuzey İrlanda", flag: "https://flagcdn.com/w40/gb-nir.png" },

    // --- PLAY-OFF YOL 3 (Hedef: D Grubu) ---
    "PO3_T1": { name: "Slovakya", flag: "https://flagcdn.com/w40/sk.png" },
    "PO3_T2": { name: "Kosova", flag: "https://flagcdn.com/w40/xk.png" },
    "PO3_T3": { name: "Türkiye", flag: "https://flagcdn.com/w40/tr.png" },
    "PO3_T4": { name: "Romanya", flag: "https://flagcdn.com/w40/ro.png" },

    // --- PLAY-OFF YOL 4 (Hedef: F Grubu) ---
    "PO4_T1": { name: "Ukrayna", flag: "https://flagcdn.com/w40/ua.png" },
    "PO4_T2": { name: "İsveç", flag: "https://flagcdn.com/w40/se.png" },
    "PO4_T3": { name: "Polonya", flag: "https://flagcdn.com/w40/pl.png" },
    "PO4_T4": { name: "Arnavutluk", flag: "https://flagcdn.com/w40/al.png" },

    // --- PLAY-OFF YOL 5 (Hedef: I Grubu) ---
    "PO5_T1": { name: "Irak", flag: "https://flagcdn.com/w40/iq.png" },
    "PO5_T4": { name: "Bolivya", flag: "https://flagcdn.com/w40/bo.png" },
    "PO5_T3": { name: "Surinam", flag: "https://flagcdn.com/w40/sr.png" },
    "PO5_T2": { name: "Bay Geçer", flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/40px-International_Flag_of_Planet_Earth.svg.png" },

    // --- PLAY-OFF YOL 6 (Hedef: K Grubu) ---
    "PO6_T1": { name: "Kongo DC", flag: "https://flagcdn.com/w40/cd.png" },
    "PO6_T4": { name: "Yeni Kaledonya", flag: "https://flagcdn.com/w40/nc.png" },
    "PO6_T3": { name: "Jamaika", flag: "https://flagcdn.com/w40/jm.png" },
    "PO6_T2": { name: "Bay Geçer", flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/40px-International_Flag_of_Planet_Earth.svg.png" }
};
// ... KENDİ TAKIMLARININ OLDUĞU "CUSTOM_TEAMS" BÖLÜMÜ YUKARIDA AYNI KALACAK ...

function getTeamData(teamId) {
    if (!teamId) return { name: "Bekleniyor...", flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/40px-International_Flag_of_Planet_Earth.svg.png" };
    if (CUSTOM_TEAMS[teamId]) return CUSTOM_TEAMS[teamId];
    return { name: teamId, flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/40px-International_Flag_of_Planet_Earth.svg.png" };
}

// ========================================================================
// ⚙️ YENİ: ÖZEL BİLDİRİM (MODAL) YÖNETİCİSİ
// ========================================================================
function showCustomAlert(message) {
    document.getElementById('custom-modal-title').innerText = 'Bildirim';
    document.getElementById('custom-modal-message').innerText = message;
    document.getElementById('custom-modal-btn-cancel').style.display = 'none';
    
    const modal = document.getElementById('custom-modal');
    const btnOk = document.getElementById('custom-modal-btn-ok');
    
    modal.style.display = 'block';
    btnOk.onclick = function() { modal.style.display = 'none'; };
}

function showCustomConfirm(message, onConfirmCallback) {
    document.getElementById('custom-modal-title').innerText = 'Onay Gerekli';
    document.getElementById('custom-modal-message').innerText = message;
    document.getElementById('custom-modal-btn-cancel').style.display = 'block';
    
    const modal = document.getElementById('custom-modal');
    const btnOk = document.getElementById('custom-modal-btn-ok');
    const btnCancel = document.getElementById('custom-modal-btn-cancel');
    
    modal.style.display = 'block';
    
    btnOk.onclick = function() {
        modal.style.display = 'none';
        if(onConfirmCallback) onConfirmCallback();
    };
    btnCancel.onclick = function() {
        modal.style.display = 'none';
    };
}


// ========================================================================
// ⚙️ SİSTEM MİMARİSİ VE YEREL DEPOLAMA
// ========================================================================

const groupsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const playoffTargetGroups = ['A', 'B', 'D', 'F', 'I', 'K'];

let playoffs = [];
let groups = {};
let bracket = { r32: [], r16: [], qf: [], sf: [], final: [], thirdPlace: [] };
let currentStage = 1;
let groupMode = 'quick'; // Varsayılan
let currentTheme = 'light'; // Varsayılan
let manualSelectedThirds = [];

function initializeData() {
    playoffs = [];
    for (let i = 1; i <= 6; i++) {
        let sf1Winner = null;
        let sf2Winner = null;
        
        // YENİ: Bay Geçer Kontrolü (Rakibi otomatik Play-off finaline atar)
        if (CUSTOM_TEAMS[`PO${i}_T1`] && CUSTOM_TEAMS[`PO${i}_T1`].name === "Bay Geçer") sf1Winner = `PO${i}_T2`;
        if (CUSTOM_TEAMS[`PO${i}_T2`] && CUSTOM_TEAMS[`PO${i}_T2`].name === "Bay Geçer") sf1Winner = `PO${i}_T1`;
        
        if (CUSTOM_TEAMS[`PO${i}_T3`] && CUSTOM_TEAMS[`PO${i}_T3`].name === "Bay Geçer") sf2Winner = `PO${i}_T4`;
        if (CUSTOM_TEAMS[`PO${i}_T4`] && CUSTOM_TEAMS[`PO${i}_T4`].name === "Bay Geçer") sf2Winner = `PO${i}_T3`;

        playoffs.push({ 
            id: i, 
            sf1: [`PO${i}_T1`, `PO${i}_T2`], sf1Winner: sf1Winner, 
            sf2: [`PO${i}_T3`, `PO${i}_T4`], sf2Winner: sf2Winner, 
            finalWinner: null, 
            targetGroup: playoffTargetGroups[i - 1] 
        });
    }
    groups = {};
    groupsList.forEach(g => {
        groups[g] = { teams: [`${g}1`, `${g}2`, `${g}3`], matches: [], standings: [] };
        if (!playoffTargetGroups.includes(g)) groups[g].teams.push(`${g}4`);
    });
    bracket = { r32: [], r16: Array(8).fill(null).map(()=>({t1:null, t2:null, w:null})), qf: Array(4).fill(null).map(()=>({t1:null, t2:null, w:null})), sf: Array(2).fill(null).map(()=>({t1:null, t2:null, w:null})), final: [{t1:null, t2:null, w:null}], thirdPlace: [{t1:null, t2:null, w:null}] };
    currentStage = 1; 
    manualSelectedThirds = [];
}

function saveData() {
    // DÜZELTME: Oyun verilerini ayrı, kullanıcı ayarlarını ayrı kasaya kaydediyoruz
    localStorage.setItem('wc2026_save', JSON.stringify({ playoffs, groups, bracket, currentStage, manualSelectedThirds }));
    localStorage.setItem('wc2026_prefs', JSON.stringify({ currentTheme, groupMode }));
}

function loadData() {
    // 1. Önce Ayarları (Tema ve Mod) Yükle
    const prefs = localStorage.getItem('wc2026_prefs');
    if (prefs) {
        const parsedPrefs = JSON.parse(prefs);
        currentTheme = parsedPrefs.currentTheme || 'light';
        groupMode = parsedPrefs.groupMode || 'quick';
    }

    // 2. Sonra Turnuva Verilerini Yükle
    const saved = localStorage.getItem('wc2026_save');
    if (saved) {
        const parsed = JSON.parse(saved);
        playoffs = parsed.playoffs; groups = parsed.groups; bracket = parsed.bracket; currentStage = parsed.currentStage;
        manualSelectedThirds = parsed.manualSelectedThirds || [];
        return true;
    }
    return false;
}

document.getElementById('btn-restart').addEventListener('click', () => {
    showCustomConfirm("Tüm tahminleriniz silinecek...", () => {
        localStorage.removeItem('wc2026_save');
        localStorage.removeItem('wc2026_voted'); // ✅ Bunu da ekle
        location.reload();
    });
});

function resetKnockouts() {
    bracket = { r32: [], r16: Array(8).fill(null).map(()=>({t1:null, t2:null, w:null})), qf: Array(4).fill(null).map(()=>({t1:null, t2:null, w:null})), sf: Array(2).fill(null).map(()=>({t1:null, t2:null, w:null})), final: [{t1:null, t2:null, w:null}], thirdPlace: [{t1:null, t2:null, w:null}] };
    manualSelectedThirds = []; 
    document.getElementById('nav-stage3').disabled = true;
    document.getElementById('nav-stage4').disabled = true;
    window.hasSavedChampion = false; // YENİ EKLENDİ (Yeni oyun için kilidi açar)
    localStorage.removeItem('wc2026_voted'); // ✅ Kilidi kaldır ki yeni şampiyonu oylayabilsin
    window.hasSavedChampion = false;
}

window.switchStage = function(stageNum) {
    currentStage = stageNum; saveData();
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`stage${stageNum}`).classList.add('active');
    document.getElementById(`nav-stage${stageNum}`).classList.add('active');
    
    if (stageNum === 1) renderPlayoffs();
    if (stageNum === 2) { document.getElementById('nav-stage2').disabled = false; updateSettingsUI(); initGroups(); }
    if (stageNum === 3) { document.getElementById('nav-stage3').disabled = false; renderBracket(); }
    if (stageNum === 4) { document.getElementById('nav-stage4').disabled = false; renderResults(); }
}

// --- AYARLAR VE TEMA ---
window.setTheme = function(theme) {
    currentTheme = theme;
    if(theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    saveData(); updateSettingsUI();
}

window.changeGroupMode = function(mode) {
    if (groupMode !== mode) {
        showCustomConfirm("Modu değiştirmek, mevcut skorları ve eleme ağacını sıfırlayacaktır. Emin misiniz?", () => {
            groupMode = mode;
            groupsList.forEach(g => {
                groups[g].matches.forEach(m => { m.s1 = null; m.s2 = null; m.w = null; });
            });
            resetKnockouts(); updateSettingsUI(); initGroups(); saveData();
            document.getElementById('settings-modal').style.display = 'none';
        });
    }
}

function updateSettingsUI() {
    document.getElementById('theme-light').classList.toggle('active-setting', currentTheme === 'light');
    document.getElementById('theme-dark').classList.toggle('active-setting', currentTheme === 'dark');
    document.getElementById('mode-quick').classList.toggle('active-setting', groupMode === 'quick');
    document.getElementById('mode-score').classList.toggle('active-setting', groupMode === 'score');
}

// Modal Kapatma Olayları
window.onclick = function(event) {
    if (event.target == document.getElementById('settings-modal')) document.getElementById('settings-modal').style.display = "none";
    if (event.target == document.getElementById('custom-modal')) document.getElementById('custom-modal').style.display = "none";
}

function renderTeamContent(teamId) {
    const team = getTeamData(teamId);
    return `<img src="${team.flag}" class="flag" alt="flag"> <span>${team.name}</span>`;
}
function renderTeamOption(teamId, matchId, isSelected, onClickFn) {
    const team = getTeamData(teamId);
    const selectedClass = isSelected ? 'selected' : '';
    const isBayGecer = team.name === 'Bay Geçer';
    const clickAttr = (teamId && !teamId.startsWith('Bekleniyor') && !isBayGecer) ? `onclick="${onClickFn}"` : '';
    const hoverAttr = getHoverAttr(teamId);
    const extraStyle = isBayGecer ? 'opacity: 0.4; cursor: not-allowed;' : '';
    return `<div class="team-option ${selectedClass}" id="${matchId}" ${clickAttr} ${hoverAttr} style="${extraStyle}">${renderTeamContent(teamId)}</div>`;
}
// --- AŞAMA 1: PLAY-OFF ---
function renderPlayoffs() {
    const container = document.getElementById('playoff-container');
    container.innerHTML = '';
    playoffs.forEach((po, index) => {
        const card = document.createElement('div'); card.className = 'card'; card.style.overflowX = 'auto'; card.style.paddingBottom = '20px';
        let fin_t1 = po.sf1Winner || null; let fin_t2 = po.sf2Winner || null;
        card.innerHTML = `
            <h3 style="text-align:center; border-bottom: none; margin-bottom: 5px;">Play-off Yolu ${po.id} <br><small style="color:var(--text-muted); font-size:0.7em;">(Hedef: Grup ${po.targetGroup})</small></h3>
            <div style="display: flex; min-width: 480px; justify-content: center; margin-top: 15px;">
                <div class="round" style="width: 220px; min-width: 220px; padding: 0 20px;">
                    <div class="match-pair">
                        <div class="knockout-match" style="margin: 5px 0; min-height: auto;"><div class="match-select">
                            ${renderTeamOption(po.sf1[0], `po-${index}-sf1-0`, po.sf1Winner === po.sf1[0], `selectPlayoffWinner(${index}, 'sf1', '${po.sf1[0]}')`)}
                            ${renderTeamOption(po.sf1[1], `po-${index}-sf1-1`, po.sf1Winner === po.sf1[1], `selectPlayoffWinner(${index}, 'sf1', '${po.sf1[1]}')`)}
                        </div></div>
                        <div class="knockout-match" style="margin: 5px 0; min-height: auto;"><div class="match-select">
                            ${renderTeamOption(po.sf2[0], `po-${index}-sf2-0`, po.sf2Winner === po.sf2[0], `selectPlayoffWinner(${index}, 'sf2', '${po.sf2[0]}')`)}
                            ${renderTeamOption(po.sf2[1], `po-${index}-sf2-1`, po.sf2Winner === po.sf2[1], `selectPlayoffWinner(${index}, 'sf2', '${po.sf2[1]}')`)}
                        </div></div>
                    </div>
                </div>
                <div class="round" style="width: 220px; min-width: 220px; padding: 0 20px; justify-content: center;">
                    <div class="knockout-match" style="${po.sf1Winner && po.sf2Winner ? 'border-color: var(--primary-color); box-shadow: 0 0 10px rgba(212,175,55,0.2);' : 'opacity: 0.7;'} min-height: auto;">
                        <div style="text-align:center; margin-bottom:5px; font-size:0.8em; color:var(--primary-color);">FİNAL</div>
                        <div class="match-select">
                            ${renderTeamOption(fin_t1, `po-${index}-final-0`, po.finalWinner === fin_t1 && fin_t1 !== null, `selectPlayoffWinner(${index}, 'final', '${fin_t1}')`)}
                            ${renderTeamOption(fin_t2, `po-${index}-final-1`, po.finalWinner === fin_t2 && fin_t2 !== null, `selectPlayoffWinner(${index}, 'final', '${fin_t2}')`)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.selectPlayoffWinner = function(index, stage, teamId) {
    if (stage === 'sf1') playoffs[index].sf1Winner = teamId;
    if (stage === 'sf2') playoffs[index].sf2Winner = teamId;
    if (stage === 'final') playoffs[index].finalWinner = teamId;
    if (stage !== 'final') playoffs[index].finalWinner = null; 
    saveData(); renderPlayoffs();
};

document.getElementById('btn-complete-playoffs').addEventListener('click', () => {
    let allCompleted = true;
    playoffs.forEach((po) => {
        if (!po.finalWinner) allCompleted = false;
        else {
            if (!groups[po.targetGroup].teams.includes(po.finalWinner)) {
                 if(groups[po.targetGroup].teams.length >= 4) groups[po.targetGroup].teams.pop();
                 groups[po.targetGroup].teams.push(po.finalWinner);
            }
        }
    });
    
    if (!allCompleted) {
        showCustomAlert("Lütfen Play-off aşamasındaki tüm final maçlarının kazananlarını seçin!");
        return;
    }
    switchStage(2);
});

// --- AŞAMA 2: GRUPLAR ---
function initGroups() {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    document.getElementById('manual-thirds-screen').style.display = 'none';
    document.getElementById('groups-main-screen').style.display = 'block';

    groupsList.forEach(g => {
        const group = groups[g]; const t = group.teams;
        if(group.matches.length === 0) {
            group.matches = [ { t1: t[0], t2: t[1], s1: null, s2: null, w: null }, { t1: t[2], t2: t[3], s1: null, s2: null, w: null }, { t1: t[0], t2: t[2], s1: null, s2: null, w: null }, { t1: t[1], t2: t[3], s1: null, s2: null, w: null }, { t1: t[0], t2: t[3], s1: null, s2: null, w: null }, { t1: t[1], t2: t[2], s1: null, s2: null, w: null } ];
        }
        
        const card = document.createElement('div'); card.className = 'card';
        let matchHTML = group.matches.map((m, mIdx) => {
            let html = '';
            if (groupMode === 'score') {
                html = `<div class="match" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="flex:1; text-align:right; cursor:pointer;" ${getHoverAttr(m.t1)}>${renderTeamContent(m.t1)}</div>
                    <div class="score-inputs" style="margin:0 10px;">
                        <input type="number" min="0" value="${m.s1!==null?m.s1:''}" onchange="updateGroupScore('${g}', ${mIdx}, 's1', this.value)"> - 
                        <input type="number" min="0" value="${m.s2!==null?m.s2:''}" onchange="updateGroupScore('${g}', ${mIdx}, 's2', this.value)">
                    </div>
                    <div style="flex:1; text-align:left; cursor:pointer;" ${getHoverAttr(m.t2)}>${renderTeamContent(m.t2)}</div>
                </div>`;
            } else {
                html = `<div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
                    <div class="team-option ${m.w === 't1' ? 'selected' : ''}" style="flex:1; padding:8px 5px;" onclick="updateGroupQuick('${g}', ${mIdx}, 't1')" ${getHoverAttr(m.t1)}>${renderTeamContent(m.t1)}</div>
                    <div class="team-option ${m.w === 'draw' ? 'selected' : ''}" style="width:35px; min-width:35px; padding:8px 0; justify-content:center; font-weight:bold; font-size:1.1em; color:var(--text-muted);" title="Berabere" onclick="updateGroupQuick('${g}', ${mIdx}, 'draw')">X</div>
                    <div class="team-option ${m.w === 't2' ? 'selected' : ''}" style="flex:1; padding:8px 5px;" onclick="updateGroupQuick('${g}', ${mIdx}, 't2')" ${getHoverAttr(m.t2)}>${renderTeamContent(m.t2)}</div>
                </div>`;
            }
            return html;
        }).join('');

        card.innerHTML = `<h3>Grup ${g}</h3>${matchHTML}<table id="table-${g}" style="margin-top:15px;"><thead><tr><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>Av</th><th>P</th></tr></thead><tbody></tbody></table>`;
        container.appendChild(card);
        updateTable(g);
    });
}

window.updateGroupScore = function(groupName, matchIdx, scoreField, value) {
    groups[groupName].matches[matchIdx][scoreField] = value === '' ? null : parseInt(value);
    resetKnockouts(); updateTable(groupName); saveData();
}

window.updateGroupQuick = function(groupName, matchIdx, result) {
    groups[groupName].matches[matchIdx].w = result;
    resetKnockouts(); updateTable(groupName); initGroups(); saveData(); 
}

function updateTable(g) {
    const group = groups[g]; let stats = {};
    group.teams.forEach(t => stats[t] = { id: t, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 });
    
    group.matches.forEach(m => {
        // GÜVENLİK DUVARI: Takım boşsa (undefined) hesaplamayı atlar, çökmeyi engeller!
        if (m.t1 && m.t2 && stats[m.t1] && stats[m.t2]) {
            if (groupMode === 'score' && m.s1 !== null && m.s2 !== null) {
                stats[m.t1].p++; stats[m.t2].p++; stats[m.t1].gf += m.s1; stats[m.t2].gf += m.s2; stats[m.t1].ga += m.s2; stats[m.t2].ga += m.s1;
                if (m.s1 > m.s2) { stats[m.t1].w++; stats[m.t2].l++; stats[m.t1].pts += 3; }
                else if (m.s1 < m.s2) { stats[m.t2].w++; stats[m.t1].l++; stats[m.t2].pts += 3; }
                else { stats[m.t1].d++; stats[m.t2].d++; stats[m.t1].pts += 1; stats[m.t2].pts += 1; }
            } else if (groupMode === 'quick' && m.w !== null) {
                stats[m.t1].p++; stats[m.t2].p++;
                if (m.w === 't1') { stats[m.t1].w++; stats[m.t2].l++; stats[m.t1].pts += 3; }
                else if (m.w === 't2') { stats[m.t2].w++; stats[m.t1].l++; stats[m.t2].pts += 3; }
                else if (m.w === 'draw') { stats[m.t1].d++; stats[m.t2].d++; stats[m.t1].pts += 1; stats[m.t2].pts += 1; }
            }
        }
    });

    group.standings = Object.values(stats).map(s => { s.gd = s.gf - s.ga; return s; }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    const tbody = document.querySelector(`#table-${g} tbody`); 
    if(tbody) {
        tbody.innerHTML = '';
        group.standings.forEach(s => {
            const team = getTeamData(s.id);
            tbody.innerHTML += `<tr><td style="text-align:left; cursor:pointer;" ${getHoverAttr(s.id)}><img src="${team.flag}" class="flag" style="vertical-align:middle; margin-right:5px;"> ${team.name}</td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gd}</td><td><strong>${s.pts}</strong></td></tr>`;
        });
    }
}

// --- AŞAMA 2.5: EN İYİ 3.LERİ SEÇME EKRANI ---
document.getElementById('btn-generate-knockouts').addEventListener('click', () => {
    let thirds = [];
    groupsList.forEach(g => {
        const s = groups[g].standings;
        thirds.push({ group: g, id: s[2].id, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf });
    });

    if (groupMode === 'quick') {
        document.getElementById('groups-main-screen').style.display = 'none';
        document.getElementById('manual-thirds-screen').style.display = 'block';
        
        thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
        const thresholdPts = thirds[7].pts;
        const lockedInTeams = thirds.filter(t => t.pts > thresholdPts).map(t => t.id);
        const bubbleTeams = thirds.filter(t => t.pts === thresholdPts).map(t => t.id);
        const lockedOutTeams = thirds.filter(t => t.pts < thresholdPts).map(t => t.id);
        
        const neededFromBubble = 8 - lockedInTeams.length;
        const isBubbleLocked = (bubbleTeams.length === neededFromBubble);
        
        window.currentLockedIn = lockedInTeams;
        window.currentBubbleNeeded = neededFromBubble;
        window.isBubbleLockedGlobal = isBubbleLocked;

        let validSelections = manualSelectedThirds.filter(id => lockedInTeams.includes(id) || bubbleTeams.includes(id));
        lockedInTeams.forEach(id => { if (!validSelections.includes(id)) validSelections.push(id); });
        if (isBubbleLocked) {
            bubbleTeams.forEach(id => { if (!validSelections.includes(id)) validSelections.push(id); });
        }
        manualSelectedThirds = validSelections;
        
        const grid = document.getElementById('manual-thirds-grid');
        grid.innerHTML = '';
        
        thirds.forEach(t => {
            const isLockedIn = lockedInTeams.includes(t.id) || (isBubbleLocked && bubbleTeams.includes(t.id));
            const isLockedOut = lockedOutTeams.includes(t.id);
            const isBubble = bubbleTeams.includes(t.id) && !isBubbleLocked;
            const isSelected = manualSelectedThirds.includes(t.id);
            
            const team = getTeamData(t.id);
            let statusText = '';
            let style = 'width:200px; padding:15px; position:relative; ';
            let clickFn = '';

            if (isLockedIn) {
                style += 'border-color: #4CAF50; opacity: 0.9; cursor: not-allowed;';
                statusText = '<div style="color:#4CAF50; font-weight:bold; font-size:0.85em; margin-top:8px;">✓ Garantiledi</div>';
            } else if (isLockedOut) {
                style += 'border-color: #ff4d4d; opacity: 0.4; cursor: not-allowed;';
                statusText = '<div style="color:#ff4d4d; font-weight:bold; font-size:0.85em; margin-top:8px;">❌ Elendi</div>';
            } else if (isBubble) {
                style += 'cursor: pointer;';
                statusText = '<div style="color:var(--primary-color); font-weight:bold; font-size:0.85em; margin-top:8px;">⚠️ Seçim Bekliyor</div>';
                clickFn = `onclick="toggleManualThird('${t.id}')"`;
            }

            grid.innerHTML += `
                <div class="team-option ${isSelected ? 'selected' : ''}" style="${style}" ${clickFn}>
                    <img src="${team.flag}" class="flag"> 
                    <div style="flex:1; text-align:center;">
                        ${team.name}<br>
                        <small style="color:var(--text-muted);">Grup ${t.group} (${t.pts} Puan)</small>
                        ${statusText}
                    </div>
                </div>
            `;
        });
        updateThirdsCount();
    } else {
        generateBracket();
    }
});

window.toggleManualThird = function(teamId) {
    if (manualSelectedThirds.includes(teamId)) {
        manualSelectedThirds = manualSelectedThirds.filter(t => t !== teamId);
    } else {
        const currentBubblePicks = manualSelectedThirds.filter(id => !window.currentLockedIn.includes(id)).length;
        if (currentBubblePicks < window.currentBubbleNeeded) {
            manualSelectedThirds.push(teamId);
        } else {
            showCustomAlert(`Puan eşitliğinden dolayı sadece ${window.currentBubbleNeeded} takım daha seçebilirsiniz!`);
            return;
        }
    }
    document.getElementById('btn-generate-knockouts').click(); 
    saveData();
}

function updateThirdsCount() {
    const count = manualSelectedThirds.length;
    document.getElementById('thirds-count').innerText = count;
    
    const btn = document.getElementById('btn-confirm-thirds');
    if (count === 8) {
        btn.disabled = false;
        if (window.currentBubbleNeeded === 0 || window.currentLockedIn.length === 8 || window.isBubbleLockedGlobal) {
            btn.innerText = "Puanlar Kesin! Son 32'ye Geç";
            btn.style.backgroundColor = "#4CAF50"; btn.style.color = "white";
        } else {
            btn.innerText = "Ağacı Oluştur ve Son 32'ye Geç";
            btn.style.backgroundColor = "var(--primary-color)"; btn.style.color = "black";
        }
    } else {
        btn.disabled = true;
        btn.innerText = "Lütfen Seçimi Tamamlayın";
        btn.style.backgroundColor = "#555"; btn.style.color = "#aaa";
    }
}

document.getElementById('btn-confirm-thirds').addEventListener('click', () => {
    if(manualSelectedThirds.length === 8) generateBracket();
});

// --- AŞAMA 3: ELEME AĞACINI OLUŞTURMA ---
function generateBracket() {
    let firsts = {}, seconds = {}, thirds = [];
    groupsList.forEach(g => {
        const s = groups[g].standings;
        firsts[g] = s[0].id; seconds[g] = s[1].id;
        thirds.push({ group: g, id: s[2].id, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf });
    });

    let bestThirds = [];
    if (groupMode === 'score') {
        thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
        bestThirds = thirds.slice(0, 8);
    } else {
        bestThirds = thirds.filter(t => manualSelectedThirds.includes(t.id));
    }

    const thirdRules = [
        { matchIdx: 0, allowed: ['A','B','C','D','F'] }, { matchIdx: 1, allowed: ['C','D','F','G','H'] }, 
        { matchIdx: 6, allowed: ['B','E','F','I','J'] }, { matchIdx: 7, allowed: ['A','E','H','I','J'] }, 
        { matchIdx: 10, allowed: ['C','E','F','H','I'] }, { matchIdx: 11, allowed: ['E','H','I','J','K'] },
        { matchIdx: 14, allowed: ['E','F','G','I','J'] }, { matchIdx: 15, allowed: ['D','E','I','J','L'] } 
    ];

    function solveThirds(teams, index, assignment) {
        if (index === 8) return assignment; 
        const rule = thirdRules[index];
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            if (!team.used && rule.allowed.includes(team.group)) {
                team.used = true;
                assignment[rule.matchIdx] = team.id;
                const result = solveThirds(teams, index + 1, assignment);
                if (result) return result;
                team.used = false; 
            }
        }
        return null;
    }
    
    bestThirds.forEach(t => t.used = false);
    let finalAssignments = solveThirds(bestThirds, 0, {});

    if (!finalAssignments) {
        finalAssignments = {};
        bestThirds.forEach(t => t.used = false);
        thirdRules.forEach(rule => {
            let found = bestThirds.find(t => !t.used && rule.allowed.includes(t.group));
            if (!found) found = bestThirds.find(t => !t.used); 
            if (found) { found.used = true; finalAssignments[rule.matchIdx] = found.id; }
        });
    }

    bracket.r32 = [
        { t1: firsts['E'], t2: finalAssignments[0], w: null }, { t1: firsts['I'], t2: finalAssignments[1], w: null },
        { t1: seconds['A'], t2: seconds['B'], w: null }, { t1: firsts['F'], t2: seconds['C'], w: null },
        { t1: seconds['K'], t2: seconds['L'], w: null }, { t1: firsts['H'], t2: seconds['J'], w: null },
        { t1: firsts['D'], t2: finalAssignments[6], w: null }, { t1: firsts['G'], t2: finalAssignments[7], w: null },
        { t1: firsts['C'], t2: seconds['F'], w: null }, { t1: seconds['E'], t2: seconds['I'], w: null },
        { t1: firsts['A'], t2: finalAssignments[10], w: null }, { t1: firsts['L'], t2: finalAssignments[11], w: null },
        { t1: firsts['J'], t2: seconds['H'], w: null }, { t1: seconds['D'], t2: seconds['G'], w: null },
        { t1: firsts['B'], t2: finalAssignments[14], w: null }, { t1: firsts['K'], t2: finalAssignments[15], w: null }
    ];

    switchStage(3);
}

// --- YENİ: AĞAÇ SEÇİMLERİ, OTOMATİK GEÇİŞ VE KAYDIRMA ---
window.selectKnockoutWinner = function(round, matchIdx, teamId) {
    function isRoundComplete(r) { return bracket[r].every(m => m.w !== null); }
    
    if (round === 'r16' && !isRoundComplete('r32')) { showCustomAlert("Lütfen önce Son 32 turundaki tüm maçları tamamlayın!"); return; }
    if (round === 'qf' && !isRoundComplete('r16')) { showCustomAlert("Lütfen önce Son 16 turundaki tüm maçları tamamlayın!"); return; }
    if (round === 'sf' && !isRoundComplete('qf')) { showCustomAlert("Lütfen önce Çeyrek Final turundaki tüm maçları tamamlayın!"); return; }
    if ((round === 'final' || round === 'thirdPlace') && !isRoundComplete('sf')) { showCustomAlert("Lütfen önce Yarı Final turundaki tüm maçları tamamlayın!"); return; }

    bracket[round][matchIdx].w = teamId;
    const rounds = ['r32', 'r16', 'qf', 'sf', 'final'];
    const currentRoundIdx = rounds.indexOf(round);
    
    if (round === 'sf') {
        const match = bracket.sf[matchIdx];
        const loserId = (match.t1 === teamId) ? match.t2 : match.t1;
        const slot = matchIdx % 2 === 0 ? 't1' : 't2';
        bracket['final'][0][slot] = teamId; bracket['final'][0].w = null; 
        bracket['thirdPlace'][0][slot] = loserId; bracket['thirdPlace'][0].w = null;
    } else if (currentRoundIdx !== -1 && currentRoundIdx < rounds.length - 1) { 
        const nextRound = rounds[currentRoundIdx + 1];
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const slot = matchIdx % 2 === 0 ? 't1' : 't2';
        bracket[nextRound][nextMatchIdx][slot] = teamId; bracket[nextRound][nextMatchIdx].w = null; 
    }
    
    if (round === 'thirdPlace') bracket['thirdPlace'][0].w = teamId;
    saveData(); 
    renderBracket();

    // YENİ: HER İKİ FİNAL MAÇI BİTİNCE OTOMATİK SONUCA GEÇ (KONFETİLİ)
    if (bracket.final[0].w && bracket.thirdPlace[0].w) {
        setTimeout(() => {
            switchStage(4);
        }, 800); // Seçimi görsün diye 0.8 saniye bekler ve geçer
        return; // Kaydırma animasyonunu yapmasın diye buradan çıkarız
    }

    let nextColMap = { 'r32': 'r16', 'r16': 'qf', 'qf': 'sf', 'sf': 'final-col' };
    if (round !== 'final' && round !== 'thirdPlace' && isRoundComplete(round)) {
        let nextColId = 'round-col-' + nextColMap[round];
        setTimeout(() => {
            const col = document.getElementById(nextColId);
            if(col) col.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }, 150); 
    }
};

function createMatchHTML(m, roundId, i) {
    return `<div class="knockout-match"><div class="match-select">
            ${renderTeamOption(m.t1, `${roundId}-${i}-t1`, m.w === m.t1, `selectKnockoutWinner('${roundId}', ${i}, '${m.t1}')`)}
            ${renderTeamOption(m.t2, `${roundId}-${i}-t2`, m.w === m.t2, `selectKnockoutWinner('${roundId}', ${i}, '${m.t2}')`)}
        </div></div>`;
}

function renderBracketColumn(title, roundId, matches, extraClass = "") {
    let html = `<div class="round ${extraClass}" id="round-col-${roundId}"><h3 class="round-title">${title}</h3>`;
    for (let i = 0; i < matches.length; i += 2) {
        if (i + 1 < matches.length) {
            html += `<div class="match-pair">${createMatchHTML(matches[i], roundId, i)}${createMatchHTML(matches[i+1], roundId, i+1)}</div>`;
        } else {
            html += createMatchHTML(matches[i], roundId, i);
        }
    }
    return html + `</div>`;
}

function renderBracket() {
    if(bracket.r32.length === 0) return;
    const container = document.getElementById('bracket-container');
    
    // YENİ: FİNAL MAÇININ HİZALAMASI MERKEZE ALINDI
    let finalColumnHTML = `<div class="round final-column" id="round-col-final-col" style="justify-content: flex-start;">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative;">
            <h3 class="round-title" style="color:var(--primary-color); position: absolute; top: 0; width: 100%; text-align: center;">🏆 BÜYÜK FİNAL</h3>
            <div class="knockout-match" style="border-color:var(--primary-color); border-width:2px; box-shadow: 0 0 15px rgba(212,175,55,0.3);">
                <div class="match-select">
                    ${renderTeamOption(bracket.final[0].t1, `final-0-t1`, bracket.final[0].w === bracket.final[0].t1, `selectKnockoutWinner('final', 0, '${bracket.final[0].t1}')`)}
                    ${renderTeamOption(bracket.final[0].t2, `final-0-t2`, bracket.final[0].w === bracket.final[0].t2, `selectKnockoutWinner('final', 0, '${bracket.final[0].t2}')`)}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--border-color);">
            <div class="third-place-title" style="text-align:center; color:var(--text-muted); margin-bottom:10px;">🥉 Üçüncülük Maçı</div>
            <div class="knockout-match third-place-match" style="border-color:var(--border-color);">
                <div class="match-select">
                    ${renderTeamOption(bracket.thirdPlace[0].t1, `thirdPlace-0-t1`, bracket.thirdPlace[0].w === bracket.thirdPlace[0].t1, `selectKnockoutWinner('thirdPlace', 0, '${bracket.thirdPlace[0].t1}')`)}
                    ${renderTeamOption(bracket.thirdPlace[0].t2, `thirdPlace-0-t2`, bracket.thirdPlace[0].w === bracket.thirdPlace[0].t2, `selectKnockoutWinner('thirdPlace', 0, '${bracket.thirdPlace[0].t2}')`)}
                </div>
            </div>
        </div>
    </div>`;
    
    container.innerHTML = renderBracketColumn('Son 32', 'r32', bracket.r32) + renderBracketColumn('Son 16', 'r16', bracket.r16) + renderBracketColumn('Çeyrek Final', 'qf', bracket.qf) + renderBracketColumn('Yarı Final', 'sf', bracket.sf) + finalColumnHTML;
}

// --- AŞAMA 4: SONUÇLAR, KONFETİ VE GLOBAL HEATMAP ---
function renderResults() {
    const container = document.getElementById('results-container');
    const champ = bracket.final[0].w;
    const runnerUp = bracket.final[0].t1 === champ ? bracket.final[0].t2 : bracket.final[0].t1;
    const third = bracket.thirdPlace[0].w;
    const fourth = bracket.thirdPlace[0].t1 === third ? bracket.thirdPlace[0].t2 : bracket.thirdPlace[0].t1;

    // ✅ DÜZELTME: window yerine localStorage kontrolü yapıyoruz
    const hasVoted = localStorage.getItem('wc2026_voted');

    if (!hasVoted) {
        if (typeof saveGlobalStats === "function") {
            saveGlobalStats(champ, runnerUp, third, fourth);
            localStorage.setItem('wc2026_voted', 'true'); // Kalıcı olarak oy verildi işaretle
        }
    }

    function getEliminated(roundArray) {
        return roundArray.map(m => { if (!m.w) return null; return m.w === m.t1 ? m.t2 : m.t1; }).filter(t => t !== null);
    }

    const eliminatedQF = getEliminated(bracket.qf);
    const eliminatedR16 = getEliminated(bracket.r16);

    let html = `
        <div class="result-tier"><h3>DÜNYA ŞAMPİYONU</h3><div class="result-grid"><div class="result-card champ-card">${renderTeamContent(champ)}</div></div></div>
        <div class="result-tier"><h3>Kürsü</h3><div class="result-grid">
            <div class="result-card">🥈 2. ${renderTeamContent(runnerUp)}</div>
            <div class="result-card">🥉 3. ${renderTeamContent(third)}</div>
            <div class="result-card">🏅 4. ${renderTeamContent(fourth)}</div>
        </div></div>
        <div class="result-tier"><h3>Çeyrek Finalde Veda Edenler</h3><div class="result-grid">${eliminatedQF.map(t => `<div class="result-card">${renderTeamContent(t)}</div>`).join('')}</div></div>
        <div class="result-tier"><h3>Son 16'da Veda Edenler</h3><div class="result-grid">${eliminatedR16.map(t => `<div class="result-card">${renderTeamContent(t)}</div>`).join('')}</div></div>
        
        <div style="margin: 40px 0 20px 0; text-align: center;">
            <button onclick="downloadBracket()" class="action-btn" style="background-color: #25D366; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: auto; padding: 12px 30px; margin: 0 auto; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.4);">
                📸 Tahmin Ağacımı İndir (Son 16'dan İtibaren)
            </button>
        </div>
    `;

    // YENİ: DÜNYANIN SEÇİMİ BAŞLIĞI
    html += `
        <div id="global-heatmap-container" style="margin-top: 50px; padding-top: 20px; border-top: 2px dashed var(--border-color);">
            <h3 style="color: var(--primary-color); text-align:center; margin-bottom: 20px;">🌍 DÜNYANIN SEÇİMİ (CANLI LİDERLİK TABLOSU)</h3>
            <div id="heatmap-content" style="text-align:center; color: var(--text-muted); font-size: 1.1em;">
                <span style="display:inline-block; animation: pulse 1.5s infinite;">Canlı veriler sunucudan çekiliyor...</span>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // YENİ: Firebase'den İlk 4 İstatistiklerini Çek ve Modern Tabloya Bas
    if (typeof db !== 'undefined') {
        db.ref('global_stats').on('value', (snapshot) => {
            const data = snapshot.val();
            const heatmapDiv = document.getElementById('heatmap-content');
            
            if (data && heatmapDiv) {
                // Verileri diziye çevir
                const teamsArray = Object.keys(data).map(teamName => {
                    return {
                        name: teamName,
                        gold: data[teamName].gold || 0,
                        silver: data[teamName].silver || 0,
                        bronze: data[teamName].bronze || 0,
                        fourth: data[teamName].fourth || 0
                    };
                });
                
                // Olimpiyat Sıralaması (Önce Altına, eşitse Gümüşe göre sırala)
                teamsArray.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.fourth - a.fourth);
                
                let tableHTML = `
                    <div style="overflow-x: auto;">
                        <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size: 0.95em; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background-color: var(--card-bg); border-bottom: 2px solid var(--border-color);">
                                    <th style="padding: 15px; text-align: left;">Sıra & Takım</th>
                                    <th style="padding: 15px; color: #FFD700;">🥇 Şampiyon</th>
                                    <th style="padding: 15px; color: #C0C0C0;">🥈 İkinci</th>
                                    <th style="padding: 15px; color: #CD7F32;">🥉 Üçüncü</th>
                                    <th style="padding: 15px; color: var(--text-color);">🏅 Dördüncü</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                // İsimden Bayrak Bulan Mini Fonksiyon
                const getFlagByName = (name) => {
                    for (let key in CUSTOM_TEAMS) {
                        if (CUSTOM_TEAMS[key].name === name) return CUSTOM_TEAMS[key].flag;
                    }
                    return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/40px-International_Flag_of_Planet_Earth.svg.png";
                };

                // İlk 20 Takımı Göster
                teamsArray.slice(0, 6).forEach((t, index) => {
                    const flagUrl = getFlagByName(t.name);
                    const bgClass = index % 2 === 0 ? 'background-color: rgba(0,0,0,0.1);' : 'background-color: transparent;';
                    
                    // Eğer 0 ise soluk yazsın, sayısı varsa parlasın
                    const goldStyle = t.gold > 0 ? 'font-weight:bold; color:#FFD700;' : 'color:var(--text-muted); opacity: 0.3;';
                    const silverStyle = t.silver > 0 ? 'font-weight:bold; color:#C0C0C0;' : 'color:var(--text-muted); opacity: 0.3;';
                    const bronzeStyle = t.bronze > 0 ? 'font-weight:bold; color:#CD7F32;' : 'color:var(--text-muted); opacity: 0.3;';
                    const fourthStyle = t.fourth > 0 ? 'font-weight:bold; color:var(--text-color);' : 'color:var(--text-muted); opacity: 0.3;';

                    tableHTML += `
                        <tr style="border-bottom: 1px solid var(--border-color); ${bgClass}">
                            <td style="padding: 12px 15px; text-align: left; display: flex; align-items: center; gap: 10px;">
                                <span style="width: 25px; font-weight: bold; color: var(--text-muted);">${index + 1}.</span>
                                <img src="${flagUrl}" style="width:24px; border-radius:3px; border: 1px solid #555;">
                                <span style="font-weight: bold; color: var(--text-color);">${t.name}</span>
                            </td>
                            <td style="padding: 12px 15px; ${goldStyle}">${t.gold > 0 ? t.gold : '-'}</td>
                            <td style="padding: 12px 15px; ${silverStyle}">${t.silver > 0 ? t.silver : '-'}</td>
                            <td style="padding: 12px 15px; ${bronzeStyle}">${t.bronze > 0 ? t.bronze : '-'}</td>
                            <td style="padding: 12px 15px; ${fourthStyle}">${t.fourth > 0 ? t.fourth : '-'}</td>
                        </tr>
                    `;
                });
                
                tableHTML += `</tbody></table></div>`;
                heatmapDiv.innerHTML = tableHTML;
            } else if (heatmapDiv) {
                heatmapDiv.innerHTML = "Henüz kimse turnuvayı tamamlamadı. İlk belirleyen sen ol!";
            }
        });
    }

    // Konfeti Efekti
    var duration = 4 * 1000; 
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999, disableForReducedMotion: true };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      var particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// ========================================================================
// 📸 YENİLENMİŞ AĞACI RESİM OLARAK İNDİRME 
// ========================================================================
window.downloadBracket = function() {
    const bracketDiv = document.getElementById('bracket-container');
    const r32Col = document.getElementById('round-col-r32');
    const stage3 = document.getElementById('stage3'); 
    
    showCustomAlert("Tahmin ağacınız yüksek kalitede fotoğrafa dönüştürülüyor, lütfen bekleyin...");

    const originalStage3Display = stage3.style.display;
    stage3.style.display = 'block'; 
    stage3.style.position = 'absolute'; 
    stage3.style.top = '-9999px'; 

    let originalR32Display = '';
    if (r32Col) {
        originalR32Display = r32Col.style.display;
        r32Col.style.display = 'none';
    }
    const originalOverflow = bracketDiv.style.overflowX;
    bracketDiv.style.overflowX = 'visible';

    const bgColor = window.getComputedStyle(bracketDiv).backgroundColor;
    
    setTimeout(() => {
        html2canvas(bracketDiv, {
            backgroundColor: bgColor, 
            scale: 2, 
            useCORS: true 
        }).then(canvas => {
            if (r32Col) r32Col.style.display = originalR32Display;
            bracketDiv.style.overflowX = originalOverflow;
            
            stage3.style.display = originalStage3Display;
            stage3.style.position = '';
            stage3.style.top = '';

            const link = document.createElement('a');
            link.download = 'dunya_kupasi_tahminim.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            document.getElementById('custom-modal').style.display = "none";
        }).catch(err => {
            if (r32Col) r32Col.style.display = originalR32Display;
            bracketDiv.style.overflowX = originalOverflow;
            stage3.style.display = originalStage3Display;
            stage3.style.position = '';
            stage3.style.top = '';
            
            document.getElementById('custom-modal').style.display = "none";
            alert("Resim oluşturulurken bir hata oluştu.");
        });
    }, 300);
}

// ========================================================================
// 🎲 SİMÜLASYON MOTORU (YAPAY ZEKA VE RASTGELELİK)
// ========================================================================

// Takımların Güncel Kadro Değerlerine Göre Tahmini Güçleri (100 üzerinden)
// ========================================================================
// 🎲 SİMÜLASYON MOTORU (YAPAY ZEKA VE RASTGELELİK)
// ========================================================================

// Takımların Güncel Transfermarkt Kadro Değerlerine Göre Puanları (100 üzerinden)
const teamPowers = {
    // 🌟 S Tier (Kupa Favorileri - 1 Milyar Euro Üstü)
    "İngiltere": 96, "Fransa": 95, "Brezilya": 94, "Portekiz": 93, "İspanya": 93, "Arjantin": 92,

    // ⭐ A Tier (Devler ve Yarı Finalistler - 600M - 1 Milyar Euro)
    "Almanya": 91, "İtalya": 90, "Hollanda": 89, "Belçika": 88, "Uruguay": 86,

    // 🚀 B Tier (Tehlikeli Ekipler - 300M - 600M Euro)
    "Hırvatistan": 84, "Fas": 83, "Senegal": 82, "Norveç": 82, "Türkiye": 82, "Danimarka": 81,
    "İsviçre": 80, "Fildişi Sahili": 80, "Avusturya": 80,

    // ⚔️ C Tier (Sürpriz Yapabilecekler - 150M - 300M Euro)
    "ABD": 79, "Japonya": 79, "İsveç": 78, "Mısır": 78, "Güney Kore": 78, "Meksika": 77,
    "Polonya": 77, "İskoçya": 76, "Çekya": 76, "Kolombiya": 76, "Ekvador": 76, "Kanada": 75, "Galler": 75,

    // 🛡️ D Tier (Zorlu Rakipler - 50M - 150M Euro)
    "Gana": 74, "Ukrayna": 74, "İrlanda": 74, "Cezayir": 74, "Bosna-Hersek": 73, "Slovakya": 73,
    "Romanya": 72, "Kosova": 72, "Arnavutluk": 71, "Avustralya": 71, "İran": 71, "Jamaika": 71,

    // 🏹 E Tier (Mücadeleci Takımlar - 20M - 50M Euro)
    "Paraguay": 70, "Özbekistan": 70, "Kongo DC": 70, "Güney Afrika": 69, "Tunus": 69,
    "Katar": 68, "Suudi Arabistan": 68, "Yeşil Burun Adaları": 67, "Panama": 67,
    "Kuzey Makedonya": 67, "Kuzey İrlanda": 67,

    // 🌍 F Tier (Turnuva Renkleri - 20M Euro Altı)
    "Yeni Zelanda": 65, "Irak": 65, "Ürdün": 64, "Bolivya": 64, "Curaçao": 63, "Surinam": 63,
    "Haiti": 61, "Yeni Kaledonya": 55,

    // ❌ Sistem Takımı
    "Bay Geçer": 0 // Otomatik elenmesi için gücü sıfır
};

function getTeamPower(teamId) {
    if (!teamId || teamId.startsWith('Bekleniyor') || teamId.startsWith('Belirsiz')) return 10;
    const teamName = getTeamData(teamId).name;
    return teamPowers[teamName] || 60; // Listede unutulan takım olursa 60 gücünde sayılır
}

window.runSimulation = function() {
    showCustomAlert("Zarlar atılıyor... Kalan tüm maçlar güncel kadro değerlerine göre simüle ediliyor! 🎲");

    setTimeout(() => {
        // 1. PLAY-OFF'LARI SİMÜLE ET
        playoffs.forEach(po => {
            if (!po.sf1Winner) { po.sf1Winner = (getTeamPower(po.sf1[0]) + Math.random()*30) > (getTeamPower(po.sf1[1]) + Math.random()*30) ? po.sf1[0] : po.sf1[1]; }
            if (!po.sf2Winner) { po.sf2Winner = (getTeamPower(po.sf2[0]) + Math.random()*30) > (getTeamPower(po.sf2[1]) + Math.random()*30) ? po.sf2[0] : po.sf2[1]; }
            if (!po.finalWinner) { po.finalWinner = (getTeamPower(po.sf1Winner) + Math.random()*30) > (getTeamPower(po.sf2Winner) + Math.random()*30) ? po.sf1Winner : po.sf2Winner; }
            
            if (!groups[po.targetGroup].teams.includes(po.finalWinner)) {
                if(groups[po.targetGroup].teams.length >= 4) groups[po.targetGroup].teams.pop();
                groups[po.targetGroup].teams.push(po.finalWinner);
            }
        });

        // EKSİK OLAN HAYATİ KOD BURASIYDI: Play-off'tan gelenleri maçlara yerleştir!
        groupsList.forEach(g => {
            const t = groups[g].teams;
            if(groups[g].matches.length === 6) {
                groups[g].matches[0].t1 = t[0]; groups[g].matches[0].t2 = t[1];
                groups[g].matches[1].t1 = t[2]; groups[g].matches[1].t2 = t[3];
                groups[g].matches[2].t1 = t[0]; groups[g].matches[2].t2 = t[2];
                groups[g].matches[3].t1 = t[1]; groups[g].matches[3].t2 = t[3];
                groups[g].matches[4].t1 = t[0]; groups[g].matches[4].t2 = t[3];
                groups[g].matches[5].t1 = t[1]; groups[g].matches[5].t2 = t[2];
            }
        });

        if(groups['A'].matches.length === 0) initGroups(); 
        
        groupsList.forEach(g => {
            groups[g].matches.forEach(m => {
                let p1 = getTeamPower(m.t1) + Math.random() * 40; 
                let p2 = getTeamPower(m.t2) + Math.random() * 40;
                
                if (groupMode === 'score') {
                    if (m.s1 === null || m.s2 === null) {
                        let score1 = Math.floor(p1 / 32); 
                        let score2 = Math.floor(p2 / 32);
                        if(score1 > 4) score1 = Math.floor(Math.random() * 3) + 1; 
                        if(score2 > 4) score2 = Math.floor(Math.random() * 3) + 1;
                        m.s1 = score1;
                        m.s2 = score2;
                    }
                } else {
                    if (m.w === null) {
                        if (Math.abs(p1 - p2) < 8) m.w = 'draw';
                        else m.w = p1 > p2 ? 't1' : 't2';
                    }
                }
            });
            updateTable(g); 
        });

        if (bracket.r32.length === 0) {
            let thirds = [];
            groupsList.forEach(g => {
                const s = groups[g].standings;
                thirds.push({ group: g, id: s[2].id, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf });
            });
            thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
            manualSelectedThirds = thirds.slice(0, 8).map(t => t.id);
            generateBracket(); 
        }

        const advanceKnockoutData = (round, matchIdx, teamId) => {
            bracket[round][matchIdx].w = teamId;
            const rounds = ['r32', 'r16', 'qf', 'sf', 'final'];
            const currentRoundIdx = rounds.indexOf(round);
            
            if (round === 'sf') {
                const match = bracket.sf[matchIdx];
                const loserId = (match.t1 === teamId) ? match.t2 : match.t1;
                const slot = matchIdx % 2 === 0 ? 't1' : 't2';
                bracket['final'][0][slot] = teamId; 
                bracket['thirdPlace'][0][slot] = loserId; 
            } else if (currentRoundIdx !== -1 && currentRoundIdx < rounds.length - 1) { 
                const nextRound = rounds[currentRoundIdx + 1];
                const nextMatchIdx = Math.floor(matchIdx / 2);
                const slot = matchIdx % 2 === 0 ? 't1' : 't2';
                bracket[nextRound][nextMatchIdx][slot] = teamId; 
            }
        };

        const simulateRound = (roundName) => {
            bracket[roundName].forEach((m, idx) => {
                if (!m.w && m.t1 && m.t2 && !m.t1.startsWith('Bekleniyor') && !m.t2.startsWith('Bekleniyor')) {
                    let p1 = getTeamPower(m.t1) + Math.random() * 30; 
                    let p2 = getTeamPower(m.t2) + Math.random() * 30;
                    advanceKnockoutData(roundName, idx, p1 > p2 ? m.t1 : m.t2);
                }
            });
        };

        simulateRound('r32'); simulateRound('r16'); simulateRound('qf'); 
        simulateRound('sf'); simulateRound('thirdPlace'); simulateRound('final');

        // 5. HER ŞEY BİTTİ, EKRANI YENİLE VE SONUCA GİT
        saveData();
        document.getElementById('custom-modal').style.display = "none";
        
        // YENİ EKLENEN KOD: Tüm sekmelerin kilitlerini aç!
        document.getElementById('nav-stage2').disabled = false;
        document.getElementById('nav-stage3').disabled = false;
        document.getElementById('nav-stage4').disabled = false;
        
        initGroups(); 
        renderBracket();
        if(currentStage === 1) renderPlayoffs();
        
        switchStage(4);

    }, 800);
};

// ========================================================================
// ℹ️ TAKIM BİLGİ KARTLARI (KADRO DEĞERLERİ EKLENDİ)
// ========================================================================
function getHoverAttr(teamId) {
    if (!teamId || teamId.startsWith('Bekleniyor')) return '';
    const team = getTeamData(teamId);
    if (team.name === 'Bay Geçer') return ''; // Bay Geçer'de kart açılmasın   
    return `onmousemove="showTooltip('${teamId}', event)" onmouseleave="hideTooltip()" ontouchstart="showTooltip('${teamId}', event)" ontouchend="setTimeout(hideTooltip, 1500)" oncontextmenu="return false;"`;
}

const TEAM_INFO = {
    // --- 🌟 İLK 10 ---
    "İspanya": { rank: 1, star: "Lamine Yamal", ach: "Şampiyon (2010)", value: "€ 1.17 Milyar" },
    "Arjantin": { rank: 2, star: "Lautaro Martínez", ach: "3x Şampiyon (Son: 2022)", value: "€ 553 Milyon" },
    "Fransa": { rank: 3, star: "Kylian Mbappé", ach: "2x Şampiyon (Son: 2018)", value: "€ 1.30 Milyar" },
    "İngiltere": { rank: 4, star: "Jude Bellingham", ach: "Şampiyon (1966)", value: "€ 1.32 Milyar" },
    "Brezilya": { rank: 5, star: "Vinícius Júnior", ach: "5x Şampiyon (Son: 2002)", value: "€ 924 Milyon" },
    "Portekiz": { rank: 6, star: "Rafael Leão", ach: "3.lük (1966)", value: "€ 845.5 Milyon" },
    "Hollanda": { rank: 7, star: "Xavi Simons", ach: "3x Finalist", value: "€ 797 Milyon" },
    "Fas": { rank: 8, star: "Achraf Hakimi", ach: "Yarı Final (2022)", value: "€ 450.5 Milyon" },
    "Belçika": { rank: 9, star: "Jérémy Doku", ach: "3.lük (2018)", value: "€ 450.2 Milyon" },
    "Almanya": { rank: 10, star: "Florian Wirtz", ach: "4x Şampiyon (Son: 2014)", value: "€ 827 Milyon" },

    // --- ⭐ 11-25 ARASI ---
    "Hırvatistan": { rank: 11, star: "Joško Gvardiol", ach: "Finalist (2018)", value: "€ 255.3 Milyon" },
    "Senegal": { rank: 12, star: "Pape Matar Sarr", ach: "Çeyrek Final (2002)", value: "€ 429.9 Milyon" },
    "İtalya": { rank: 13, star: "Nicolò Barella", ach: "4x Şampiyon (Son: 2006)", value: "€ 825 Milyon" },
    "Kolombiya": { rank: 14, star: "Luis Díaz", ach: "Çeyrek Final (2014)", value: "€ 292.8 Milyon" },
    "ABD": { rank: 15, star: "Christian Pulisic", ach: "Yarı Final (1930)", value: "€ 187.7 Milyon" },
    "Meksika": { rank: 16, star: "Santiago Giménez", ach: "Çeyrek Final (1970, 1986)", value: "€ 101.8 Milyon" },
    "Uruguay": { rank: 17, star: "Federico Valverde", ach: "2x Şampiyon (Son: 1950)", value: "€ 403.7 Milyon" },
    "İsviçre": { rank: 18, star: "Manuel Akanji", ach: "Çeyrek Final (1954)", value: "€ 246.3 Milyon" },
    "Japonya": { rank: 19, star: "Takefusa Kubo", ach: "Son 16 (4 Kez)", value: "€ 228.5 Milyon" },
    "İran": { rank: 20, star: "Mehdi Taremi", ach: "Grup Aşaması", value: "€ 34.05 Milyon" },
    "Danimarka": { rank: 21, star: "Rasmus Højlund", ach: "Çeyrek Final (1998)", value: "€ 383.6 Milyon" },
    "Güney Kore": { rank: 22, star: "Kim Min-jae", ach: "4.lük (2002)", value: "€ 125.1 Milyon" },
    "Ekvador": { rank: 23, star: "Moisés Caicedo", ach: "Son 16 (2006)", value: "€ 365.1 Milyon" },
    "Avusturya": { rank: 24, star: "Konrad Laimer", ach: "3.lük (1954)", value: "€ 253.6 Milyon" },
    "Türkiye": { rank: 25, star: "Arda Güler", ach: "3.lük (2002)", value: "€ 512.7 Milyon" },

    // --- 🚀 26 VE SONRASI ---
    "Avustralya": { rank: 27, star: "Harry Souttar", ach: "Son 16 (2006, 2022)", value: "€ 34.85 Milyon" },
    "Cezayir": { rank: 28, star: "Rayan Aït-Nouri", ach: "Son 16 (2014)", value: "€ 231.3 Milyon" },
    "Kanada": { rank: 29, star: "Alphonso Davies", ach: "Grup Aşaması", value: "€ 21.88 Milyon" },
    "Ukrayna": { rank: 30, star: "Georgiy Sudakov", ach: "Çeyrek Final (2006)", value: "€ 263.4 Milyon" },
    "Mısır": { rank: 31, star: "Omar Marmoush", ach: "Grup Aşaması", value: "€ 134.25 Milyon" },
    "Norveç": { rank: 32, star: "Erling Haaland", ach: "Son 16 (1998)", value: "€ 516.9 Milyon" },
    "Panama": { rank: 33, star: "Adalberto Carrasquilla", ach: "Grup Aşaması (2018)", value: "€ 6.3 Milyon" },
    "Polonya": { rank: 34, star: "Jakub Kiwior", ach: "3.lük (1974, 1982)", value: "€ 163.35 Milyon" },
    "Galler": { rank: 35, star: "Brennan Johnson", ach: "Çeyrek Final (1958)", value: "€ 205.15 Milyon" },
    "Fildişi Sahili": { rank: 37, star: "Ousmane Diomande", ach: "Grup Aşaması", value: "€ 380.5 Milyon" },
    "İskoçya": { rank: 38, star: "Scott McTominay", ach: "Grup Aşaması", value: "€ 211 Milyon" },
    "Paraguay": { rank: 40, star: "Julio Enciso", ach: "Çeyrek Final (2010)", value: "€ 125.8 Milyon" },
    "İsveç": { rank: 42, star: "Viktor Gyökeres", ach: "Finalist (1958)", value: "€ 476.48 Milyon" },
    "Çekya": { rank: 43, star: "Tomas Soucek", ach: "Finalist (1934, 1962)", value: "€ 115.9 Milyon" },
    "Slovakya": { rank: 44, star: "Dávid Hancko", ach: "Son 16 (2010)", value: "€ 133.85 Milyon" },
    "Tunus": { rank: 47, star: "Ellyes Skhiri", ach: "Grup Aşaması", value: "€ 70.75 Milyon" },
    "Kongo DC": { rank: 48, star: "Yoane Wissa", ach: "Grup Aşaması (1974)", value: "€ 153.5 Milyon" },
    "Romanya": { rank: 49, star: "Radu Dragusin", ach: "Çeyrek Final (1994)", value: "€ 120.1 Milyon" },
    "Özbekistan": { rank: 52, star: "Abbosbek Fayzullaev", ach: "Katılamadı", value: "€ 8.5 Milyon" },
    "Katar": { rank: 56, star: "Akram Afif", ach: "Grup Aşaması (2022)", value: "€ 18 Milyon" },
    "Irak": { rank: 58, star: "Ali Jasim", ach: "Grup Aşaması (1986)", value: "€ 18.13 Milyon" },
    "İrlanda": { rank: 59, star: "Evan Ferguson", ach: "Çeyrek Final (1990)", value: "€ 192.3 Milyon" },
    "Güney Afrika": { rank: 60, star: "Lyle Foster", ach: "Grup Aşaması", value: "€ 46.35 Milyon" },
    "Suudi Arabistan": { rank: 61, star: "Firas Al-Buraikan", ach: "Son 16 (1994)", value: "€ 21.8 Milyon" },
    "Arnavutluk": { rank: 63, star: "Kristjan Asllani", ach: "Grup Aşaması", value: "€ 86.35 Milyon" },
    "Ürdün": { rank: 64, star: "Mousa Al-Tamari", ach: "Katılamadı", value: "€ 9.35 Milyon" },
    "Kuzey Makedonya": { rank: 66, star: "Eljif Elmas", ach: "Katılamadı", value: "€ 37.13 Milyon" },
    "Yeşil Burun Adaları": { rank: 67, star: "Logan Costa", ach: "Katılamadı", value: "€ 33.08 Milyon" },
    "Kuzey İrlanda": { rank: 69, star: "Conor Bradley", ach: "Çeyrek Final (1958)", value: "€ 95.68 Milyon" },
    "Jamaika": { rank: 70, star: "Leon Bailey", ach: "Grup Aşaması (1998)", value: "€ 48.95 Milyon" },
    "Bosna-Hersek": { rank: 71, star: "Amar Dedić", ach: "Grup Aşaması", value: "€ 117.8 Milyon" },
    "Gana": { rank: 72, star: "Mohammed Kudus", ach: "Çeyrek Final (2010)", value: "€ 269.45 Milyon" },
    "Bolivya": { rank: 76, star: "Ramiro Vaca", ach: "Grup Aşaması", value: "€ 18.8 Milyon" },
    "Kosova": { rank: 79, star: "Edon Zhegrova", ach: "Katılamadı", value: "€ 143.38 Milyon" },
    "Curaçao": { rank: 81, star: "Juninho Bacuna", ach: "Katılamadı", value: "€ 26.03 Milyon" },
    "Haiti": { rank: 83, star: "Frantzdy Pierrot", ach: "Grup Aşaması (1974)", value: "€ 37.75 Milyon" },
    "Yeni Zelanda": { rank: 85, star: "Chris Wood", ach: "Grup Aşaması", value: "€ 21.6 Milyon" },
    "Surinam": { rank: 123, star: "Sheraldo Becker", ach: "Katılamadı", value: "€ 27.03 Milyon" },
    "Yeni Kaledonya": { rank: 150, star: "Joris Kenon", ach: "Katılamadı", value: "Bilinmiyor" }
};

window.showTooltip = function(teamId, event) {
    if (!teamId || teamId.startsWith('Bekleniyor') || teamId.startsWith('Bay Geçer')) return;

    const team = getTeamData(teamId);
    const info = TEAM_INFO[team.name] || { rank: "-", star: "Bilinmiyor", ach: "Grup Aşaması", value: "Bilinmiyor" };
    const tooltip = document.getElementById('team-tooltip');

    tooltip.innerHTML = `
        <h4><img src="${team.flag}" style="width:24px; border-radius:3px; border:1px solid #555;"> ${team.name}</h4>
        <p>🌍 <strong>Sıralama:</strong> ${info.rank}</p>
        <p>⭐ <strong>Yıldız:</strong> ${info.star}</p>
        <p>💰 <strong>Kadro Değeri:</strong> ${info.value}</p>
        <p>🏆 <strong>Tarihçe:</strong> ${info.ach}</p>
    `;

    let clientX = event.touches ? event.touches[0].clientX : event.clientX;
    let clientY = event.touches ? event.touches[0].clientY : event.clientY;

    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    
    let tooltipWidth = tooltip.offsetWidth;
    let tooltipHeight = tooltip.offsetHeight;

    let posX = clientX + 15;
    let posY = clientY + 15;

    if (posX + tooltipWidth > window.innerWidth) posX = clientX - tooltipWidth - 15;
    if (posY + tooltipHeight > window.innerHeight) posY = clientY - tooltipHeight - 15;

    tooltip.style.left = posX + window.scrollX + 'px';
    tooltip.style.top = posY + window.scrollY + 'px';
};

window.hideTooltip = function() {
    const tooltip = document.getElementById('team-tooltip');
    tooltip.style.opacity = '0';
    setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 100);
};

// ========================================================================
// 🚀 UYGULAMAYI BAŞLAT
// ========================================================================
if (!loadData()) initializeData();

setTheme(currentTheme);
switchStage(currentStage);

if (groups['A'].teams.length === 4) document.getElementById('nav-stage2').disabled = false;
if (bracket.r32.length > 0) document.getElementById('nav-stage3').disabled = false;
if (bracket.final[0] && bracket.final[0].w) document.getElementById('nav-stage4').disabled = false;
