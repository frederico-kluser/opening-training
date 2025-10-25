/**
 * SoundService - Serviço para gerenciar sons de xadrez
 * Utiliza Web Audio API para gerar sons simples sem necessidade de arquivos externos
 */

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    // Inicializar AudioContext apenas quando necessário (para evitar problemas de autoplay)
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API não suportada:', error);
      }
    }
  }

  /**
   * Toca um som de movimento normal (estilo Lichess/Chess.com - clique curto)
   */
  playMoveSound() {
    if (!this.enabled) return;
    // Som de "clique" tipo peça batendo no tabuleiro
    this.playClickSound(800, 0.04);
  }

  /**
   * Toca um som de captura (mais grave que movimento normal)
   */
  playCaptureSound() {
    if (!this.enabled) return;
    // Som mais "sólido" para captura
    this.playClickSound(600, 0.06);
  }

  /**
   * Toca um som de xeque
   */
  playCheckSound() {
    if (!this.enabled) return;
    this.playTone(600, 0.12, 'sine');
  }

  /**
   * Som de "clique" realista para movimento de peça
   */
  private playClickSound(frequency: number, duration: number) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Noise node para criar som de "clique"
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      // Gera ruído filtrado que simula um clique
      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.exp(-i / (this.audioContext.sampleRate * 0.01)); // Decay rápido
        data[i] = (Math.random() * 2 - 1) * envelope * this.volume;
      }

      const source = this.audioContext.createBufferSource();
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      filter.Q.value = 1.5;

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Erro ao tocar som de clique:', error);
    }
  }

  /**
   * Toca um som de movimento correto (feedback positivo)
   */
  playCorrectSound() {
    if (!this.enabled) return;
    // Tom duplo ascendente
    this.playTone(400, 0.08, 'sine');
    setTimeout(() => this.playTone(600, 0.08, 'sine'), 80);
  }

  /**
   * Toca um som de movimento incorreto (feedback negativo)
   */
  playIncorrectSound() {
    if (!this.enabled) return;
    // Tom descendente
    this.playTone(300, 0.12, 'sawtooth');
  }

  /**
   * Toca um som de vitória/puzzle resolvido
   */
  playSuccessSound() {
    if (!this.enabled) return;
    // Sequência de tons ascendentes
    this.playTone(400, 0.08, 'sine');
    setTimeout(() => this.playTone(500, 0.08, 'sine'), 100);
    setTimeout(() => this.playTone(600, 0.12, 'sine'), 200);
  }

  /**
   * Função genérica para tocar um tom
   * @param frequency - Frequência em Hz
   * @param duration - Duração em segundos
   * @param type - Tipo de onda (sine, square, sawtooth, triangle)
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) return;

    try {
      // Resume o contexto de áudio se estiver suspenso (política de autoplay dos navegadores)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Envelope ADSR simples para suavizar o som
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01); // Attack
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, now + duration * 0.3); // Decay
      gainNode.gain.setValueAtTime(this.volume * 0.8, now + duration * 0.7); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.error('Erro ao tocar som:', error);
    }
  }

  /**
   * Ativa ou desativa os sons
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('chess-sounds-enabled', enabled.toString());
  }

  /**
   * Verifica se os sons estão ativados
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Define o volume (0.0 a 1.0)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('chess-sounds-volume', this.volume.toString());
  }

  /**
   * Obtém o volume atual
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Carrega as preferências salvas
   */
  loadPreferences() {
    const savedEnabled = localStorage.getItem('chess-sounds-enabled');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    const savedVolume = localStorage.getItem('chess-sounds-volume');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }
}

// Exporta uma instância singleton
const soundService = new SoundService();
soundService.loadPreferences();

export default soundService;
