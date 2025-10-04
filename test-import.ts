import chessComService from './src/services/ChessComService';

async function testImport() {
  console.log('🧪 Testando importação do Chess.com...\n');

  // Teste com diferentes usernames
  const usernames = ['magnuscarlsen', 'hikaru', 'gothamchess'];

  for (const username of usernames) {
    console.log(`\n📊 Testando com ${username}:`);

    try {
      // Buscar perfil
      const profile = await chessComService.getPlayerProfile(username);
      console.log(`✅ Perfil: ${profile.username} (ID: ${profile.player_id})`);

      // Buscar arquivos
      const archives = await chessComService.getPlayerArchives(username);
      console.log(`✅ Arquivos: ${archives.length} meses disponíveis`);

      // Buscar jogos recentes
      const recentGames = await chessComService.getLatestGames(username);
      console.log(`✅ Jogos recentes: ${recentGames.length} partidas`);

      // Contar por tipo
      const counts = {
        bullet: recentGames.filter(g => g.time_class === 'bullet').length,
        blitz: recentGames.filter(g => g.time_class === 'blitz').length,
        rapid: recentGames.filter(g => g.time_class === 'rapid').length
      };
      console.log(`   - Bullet: ${counts.bullet}, Blitz: ${counts.blitz}, Rapid: ${counts.rapid}`);

      // Aguardar 1 segundo entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Erro com ${username}:`, error);
    }
  }

  console.log('\n✅ Teste de importação concluído!');
}

testImport();