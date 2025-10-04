import chessComService from './src/services/ChessComService';

// Função para testar a API do Chess.com
async function testChessComAPI() {
  console.log('🔍 Iniciando teste da API do Chess.com...\n');

  // Testar com o usuário hikaru (ou substitua por outro username)
  const username = 'hikaru';

  try {
    await chessComService.testFetchGames(username);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testChessComAPI();