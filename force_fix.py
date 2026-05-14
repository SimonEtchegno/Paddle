import os

path = r'c:\Users\Saimon\Desktop\Paddle-main\src\components\admin\TournamentManager.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_onclick = """onClick={async () => {
                    const loadingToast = toast.loading('Generando fixture y programando...');
                    setIsSyncing(true);
                    try {
                      const { data: allT } = await supabase.from('torneos').select('id, zonas_data, cuadro_data').neq('id', tournament.id);
                      const slots = { 'Viernes': { '1': [], '2': [] }, 'Sábado': { '1': [], '2': [] }, 'Domingo': { '1': [], '2': [] } };
                      allT?.forEach(t => [...(t.zonas_data || []), ...(t.cuadro_data || [])].forEach(m => {
                        if (m.date && m.time && m.court && slots[m.date]?.[m.court]) {
                          const mt = m.time.match(/(\\d+):(\\d+)/);
                          if (mt) slots[m.date][m.court].push(parseInt(mt[1])*60 + parseInt(mt[2]));
                        }
                      }));
                      const toM = (t, d) => {
                        let dm = 0; const ds = (d || '').toLowerCase();
                        if (ds.includes('sabado')) dm = 1440; else if (ds.includes('domingo')) dm = 2880;
                        const mt = (t || '').match(/(\\d+):(\\d+)/);
                        return mt ? dm + parseInt(mt[1])*60 + parseInt(mt[2]) : dm + 480;
                      };
                      let allM = [];
                      zones.forEach(z => {
                        let zm = [...z.matches];
                        if (zm.length === 0 && z.pairs.length >= 2) {
                          if (z.pairs.length === 4) {
                            const ps = [...z.pairs].sort((a,b) => getPairScore(pairs.find(p=>p.id===b), tournament.nombre) - getPairScore(pairs.find(p=>p.id===a), tournament.nombre));
                            const m1 = generateId(), m2 = generateId();
                            zm = [
                              { id: m1, p1: ps[0], p2: ps[3], score: '', status: 'pending', matchNumber: 1 },
                              { id: m2, p1: ps[1], p2: ps[2], score: '', status: 'pending', matchNumber: 2 },
                              { id: generateId(), p1: `GANADOR-${m1}`, p2: `GANADOR-${m2}`, score: '', status: 'pending', matchNumber: 3 },
                              { id: generateId(), p1: `PERDEDOR-${m1}`, p2: `PERDEDOR-${m2}`, score: '', status: 'pending', matchNumber: 4 }
                            ];
                          } else {
                            for (let i=0; i<z.pairs.length; i++) for (let j=i+1; j<z.pairs.length; j++) zm.push({ id: generateId(), p1: z.pairs[i], p2: z.pairs[j], score: '', status: 'pending', matchNumber: 1 });
                          }
                        }
                        zm.forEach(m => allM.push({ ...m, zoneId: z.id }));
                      });
                      const next = {}; allM.sort((a, b) => (a.matchNumber || 99) - (b.matchNumber || 99));
                      const res = allM.map(m => {
                        const p1 = pairs.find(p=>p.id===m.p1), p2 = pairs.find(p=>p.id===m.p2);
                        const s1 = toM(p1?.timeRange, p1?.dayRange), s2 = toM(p2?.timeRange, p2?.dayRange);
                        const e1 = toM(p1?.timeRange?.split('-')[1] || '23:59', p1?.dayRange), e2 = toM(p2?.timeRange?.split('-')[1] || '23:59', p2?.dayRange);
                        let start = Math.max(s1, s2, next[m.p1] || 0, next[m.p2] || 0);
                        if (m.matchNumber > 2) {
                          const ps = allM.filter(x => x.zoneId === m.zoneId && x.matchNumber < m.matchNumber && x.time);
                          start = Math.max(start, Math.max(0, ...ps.map(x => toM(x.time, x.date) + 60)) + 60);
                        }
                        let found = null;
                        for (const d of ['Viernes', 'Sábado', 'Domingo']) {
                          const off = d === 'Sábado' ? 1440 : (d === 'Domingo' ? 2880 : 0);
                          for (let t = 480; t <= 1350; t += 30) {
                            const abs = off + t;
                            if (abs < start || (abs + 60 > e1 && abs < e1) || (abs + 60 > e2 && abs < e2)) continue;
                            for (const c of ['1', '2']) if (!slots[d][c].some(s => Math.abs(s - t) < 60)) { found = { t, c, d, abs }; break; }
                            if (found) break;
                          }
                          if (found) break;
                        }
                        if (!found) {
                          const em = Math.max(next[m.p1] || 0, next[m.p2] || 0);
                          for (const d of ['Viernes', 'Sábado', 'Domingo']) {
                            const off = d === 'Sábado' ? 1440 : (d === 'Domingo' ? 2880 : 0);
                            for (let t = 480; t <= 1350; t += 30) {
                              if (off + t < em) continue;
                              for (const c of ['1', '2']) if (!slots[d][c].some(s => Math.abs(s - t) < 60)) { found = { t, c, d, abs: off + t }; break; }
                              if (found) break;
                            }
                            if (found) break;
                          }
                        }
                        if (found) {
                          let mns = found.abs; let dy = 'Viernes'; if (mns >= 2880) { dy = 'Domingo'; mns -= 2880; } else if (mns >= 1440) { dy = 'Sábado'; mns -= 1440; }
                          m.time = `${Math.floor(mns/60).toString().padStart(2,'0')}:${(mns%60).toString().padStart(2,'0')}`;
                          m.date = dy; m.court = found.c; slots[found.d][found.c].push(found.t);
                          next[m.p1] = found.abs + 120; next[m.p2] = found.abs + 120;
                        }
                        return m;
                      });
                      setZones(zones.map(z => ({ ...z, matches: res.filter(x => x.zoneId === z.id).map(({ zoneId, ...d }) => d) })));
                      toast.success('Fixture y horarios generados');
                    } catch (e) { toast.error('Error'); } finally { setIsSyncing(false); toast.dismiss(loadingToast); }
                  }}"""

# Buscamos el bloque onClick actual y lo reemplazamos
import re
pattern = re.compile(r'onClick=\{async \(\) => \{.*?\}\}', re.DOTALL)
new_content = pattern.sub(new_onclick, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
