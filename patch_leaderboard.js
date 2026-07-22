const fs = require('fs');
const content = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf-8');
const lines = content.split('\n');

const newCode = `
  const [leaderboards, setLeaderboards] = useState<any>({ daily: [], weekly: [], monthly: [], allTime: [] });
  
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboards(data))
      .catch(err => console.error(err));
  }, []);

  const dynamicLeaderboard = React.useMemo(() => {
    if (!leaderboards || !leaderboards.daily) return [];
    
    // Create mapping of country name to ISO code
    const getCountryCode = (countryName) => {
        if (!countryName) return "bd";
        const mapping = {
            "Bangladesh": "bd", "India": "in", "Pakistan": "pk", "United States": "us", "United Kingdom": "gb", 
            "Canada": "ca", "Australia": "au", "Malaysia": "my", "Indonesia": "id", "Brazil": "br", "Mexico": "mx",
            "Colombia": "co", "Spain": "es", "South Africa": "za", "Argentina": "ar"
        };
        const exact = mapping[countryName];
        if (exact) return exact;
        const partial = Object.keys(mapping).find(k => k.toLowerCase().includes(countryName.toLowerCase()) || countryName.toLowerCase().includes(k.toLowerCase()));
        if (partial) return mapping[partial];
        
        return "bd"; // Default
    };

    return leaderboards.daily.map((l, i) => ({
      id: l.user_id,
      name: l.nickname || l.first_name || 'Trader',
      profit: parseFloat(l.profit || l.total_profit),
      flagUrl: \`https://flagcdn.com/w40/\${getCountryCode(l.country)}.png\`,
      isCurrentUser: currentUser && currentUser.uid === l.user_id,
      rank: i + 1,
      formattedProfit: parseFloat(l.profit || l.total_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }));
  }, [leaderboards, currentUser]);
`;

lines.splice(4570, 0, newCode);
fs.writeFileSync('src/pages/TradeTerminal.tsx', lines.join('\n'));
