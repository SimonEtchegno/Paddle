import sys
import os

path = r'c:\Users\Saimon\Desktop\Paddle-main\src\components\admin\TournamentManager.tsx'

def fix_file():
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    
    # Buscamos el inicio de handleGenerateFixtures para reconstruirla limpia
    for i, line in enumerate(lines):
        if 'const handleGenerateFixtures = async () => {' in line:
            new_lines.append(line)
            new_lines.append('    const loadingToast = toast.loading("Programando partidos...");\n')
            new_lines.append('    try {\n')
            new_lines.append('      const { data: cData } = await supabase.from("partidos_torneo").select("*").neq("tournament_id", tournament.id);\n')
            new_lines.append('      const courtFreeSlots: Record<string, Record<string, number[]>> = {\n')
            new_lines.append('        "Viernes": { "1": [], "2": [] }, "Sábado": { "1": [], "2": [] }, "Domingo": { "1": [], "2": [] }\n')
            new_lines.append('      };\n')
            new_lines.append('      cData?.forEach(m => {\n')
            new_lines.append('        if (m.date && m.time && m.court) {\n')
            new_lines.append('          const d = m.date; const c = String(m.court);\n')
            new_lines.append('          if (courtFreeSlots[d] && courtFreeSlots[d][c]) {\n')
            new_lines.append('            const tMatch = m.time.match(/(\\d+):(\\d+)/);\n')
            new_lines.append('            if (tMatch) courtFreeSlots[d][c].push(parseInt(tMatch[1])*60 + parseInt(tMatch[2]));\n')
            new_lines.append('          }\n')
            new_lines.append('        }\n')
            new_lines.append('      });\n\n')
            
            new_lines.append('      const pairNextAvail: Record<string, number> = {};\n')
            new_lines.append('      const allMatchesToProcess: any[] = [];\n')
            new_lines.append('      zones.forEach(z => z.matches.forEach(m => allMatchesToProcess.push({ ...m, zoneId: z.id })));\n\n')
            
            new_lines.append('      // Función de ayuda para tiempos\n')
            new_lines.append('      const timeToMins = (t?: string, dStr?: string) => {\n')
            new_lines.append('        let dayMins = 0;\n')
            new_lines.append('        const d = (dStr || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");\n')
            new_lines.append('        if (d.includes("sabado")) dayMins = 1440; else if (d.includes("domingo")) dayMins = 2880;\n')
            new_lines.append('        const match = (t || "").match(/(\\d+):(\\d+)/);\n')
            new_lines.append('        return match ? dayMins + parseInt(match[1])*60 + parseInt(match[2]) : dayMins + 480;\n')
            new_lines.append('      };\n\n')

            new_lines.append('      // Ordenar por importancia (partidos de zona primero, luego cruces)\n')
            new_lines.append('      allMatchesToProcess.sort((a, b) => (a.matchNumber || 99) - (b.matchNumber || 99));\n\n')
            
            new_lines.append('      const scheduledMatches = allMatchesToProcess.map(m => {\n')
            new_lines.append('        const p1 = pairs.find(p => p.id === m.p1); const p2 = pairs.find(p => p.id === m.p2);\n')
            new_lines.append('        const p1Start = timeToMins(p1?.timeRange, p1?.dayRange); const p2Start = timeToMins(p2?.timeRange, p2?.dayRange);\n')
            new_lines.append('        const startLimit = Math.max(p1Start, p2Start, pairNextAvail[m.p1] || 0, pairNextAvail[m.p2] || 0);\n\n')
            
            new_lines.append('        let found = null;\n')
            new_lines.append('        const days = ["Viernes", "Sábado", "Domingo"];\n')
            new_lines.append('        for (const day of days) {\n')
            new_lines.append('          const dayOffset = day === "Sábado" ? 1440 : (day === "Domingo" ? 2880 : 0);\n')
            new_lines.append('          for (let t = 480; t <= 1380; t += 30) {\n')
            new_lines.append('            const absT = dayOffset + t;\n')
            new_lines.append('            if (absT < startLimit) continue;\n')
            new_lines.append('            for (const c of ["1", "2"]) {\n')
            new_lines.append('              if (!courtFreeSlots[day][c].some(s => Math.abs(s - t) < 60)) {\n')
            new_lines.append('                found = { t, c, day, absT }; break;\n')
            new_lines.append('              }\n')
            new_lines.append('            }\n')
            if (True): # Dummy to keep indentation
                new_lines.append('            if (found) break;\n')
                new_lines.append('          }\n')
                new_lines.append('          if (found) break;\n')
                new_lines.append('        }\n\n')
            
            new_lines.append('        if (found) {\n')
            new_lines.append('          const h = Math.floor(found.t / 60); const min = found.t % 60;\n')
            new_lines.append('          m.time = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;\n')
            new_lines.append('          m.date = found.day; m.court = found.c;\n')
            new_lines.append('          courtFreeSlots[found.day][found.c].push(found.t);\n')
            new_lines.append('          pairNextAvail[m.p1] = found.absT + 120; pairNextAvail[m.p2] = found.absT + 120;\n')
            new_lines.append('        }\n')
            new_lines.append('        return m;\n')
            new_lines.append('      });\n\n')
            
            new_lines.append('      setZones(zones.map(z => ({\n')
            new_lines.append('        ...z, matches: scheduledMatches.filter(sm => sm.zoneId === z.id).map(({zoneId, ...data}) => data)\n')
            new_lines.append('      })));\n')
            new_lines.append('      toast.success("Partidos programados correctamente");\n')
            new_lines.append('    } catch (e) { toast.error("Error al programar"); } finally { toast.dismiss(loadingToast); }\n')
            new_lines.append('  };\n')
            skip = True
        
        # Saltamos hasta el final de la función vieja
        if skip:
            if 'className="w-full md:w-auto bg-primary/10' in line:
                skip = False
                new_lines.append('\n' + line)
            continue
            
        if not skip:
            new_lines.append(line)

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

fix_file()
