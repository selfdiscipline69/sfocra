function generateAllClassEntries(classesJson) {
  const paths = [1, 2, 3]; // Mind, Body, Balanced
  const difficulties = [1, 2, 3, 4, 5]; // Daily Trials, Epic Missions, etc.
  const trackings = [1, 2, 3]; // Leveling System, Streaks & Habits, Both
  const consequences = [1, 2, 3]; // Yes Bring It On, Choose My Own Punishments, Without Consequence
  
  const allEntries = [];
  
  paths.forEach(p => {
    const path = classesJson.util.pathMap[p];
    
    difficulties.forEach(d => {
      const difficulty = classesJson.util.difficultyMap[d];
      
      trackings.forEach(t => {
        const tracking = classesJson.util.trackingMap[t];
        
        consequences.forEach(c => {
          const consequence = classesJson.util.consequenceMap[c];
          
          const className = classesJson.classMapping[path][difficulty][tracking][consequence];
          const questFormat = classesJson.questTemplates[path][difficulty].format;
          const consequenceDesc = classesJson.consequenceModifiers[consequence].description;
          
          // Create consequence suffix
          let consequenceSuffix = "";
          if (c === 1) consequenceSuffix = " with strict consequences";
          else if (c === 2) consequenceSuffix = " with self-imposed consequences";
          else if (c === 3) consequenceSuffix = " with no penalties";
          
          // Add tracking suffix
          if (t === 3) {
            if (c === 1) consequenceSuffix += " and dual tracking";
            else if (c === 2) consequenceSuffix += " and comprehensive tracking";
            else if (c === 3) consequenceSuffix += " and dual tracking";
          } else if (t === 2) {
            // Special case for streaks
            if (c === 1) consequenceSuffix = " with strict consequences for broken streaks";
            else if (c === 2) consequenceSuffix = " with self-imposed streak consequences";
            else if (c === 3) consequenceSuffix = " with flexible streaks";
          }
          
          allEntries.push({
            key: `${p}-${d}-${t}-${c}`,
            path,
            difficulty,
            tracking,
            consequence,
            class: className,
            description: `A ${path.toLowerCase()} focused hero who faces ${difficulty.toLowerCase()} with ${tracking.toLowerCase()} tracking and embraces ${consequence.toLowerCase()}.`,
            quest_format: questFormat + consequenceSuffix,
            consequence_description: consequenceDesc
          });
        });
      });
    });
  });
  
  return allEntries;
}

module.exports = { generateAllClassEntries };