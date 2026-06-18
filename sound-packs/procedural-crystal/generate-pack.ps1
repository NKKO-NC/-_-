$ErrorActionPreference = "Stop"

$packRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$source = @"
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace ProceduralCrystalAudio
{
    public sealed class StereoBuffer
    {
        public readonly int SampleRate;
        public readonly int Length;
        public readonly double[] Left;
        public readonly double[] Right;

        public StereoBuffer(double seconds, int sampleRate)
        {
            SampleRate = sampleRate;
            Length = Math.Max(1, (int)Math.Ceiling(seconds * sampleRate));
            Left = new double[Length];
            Right = new double[Length];
        }

        public void Add(int index, double value, double pan)
        {
            if (index < 0 || index >= Length) return;
            double angle = (Clamp(pan, -1.0, 1.0) + 1.0) * Math.PI / 4.0;
            Left[index] += value * Math.Cos(angle);
            Right[index] += value * Math.Sin(angle);
        }

        public void AddMono(int index, double left, double right)
        {
            if (index < 0 || index >= Length) return;
            Left[index] += left;
            Right[index] += right;
        }

        public static double Clamp(double value, double min, double max)
        {
            if (value < min) return min;
            if (value > max) return max;
            return value;
        }
    }

    public sealed class AssetInfo
    {
        public string Id;
        public string FileName;
        public string EventName;
        public string Bus;
        public double Duration;
        public string Sha256;
        public string[] Tags;

        public AssetInfo(string id, string fileName, string eventName, string bus, double duration, string sha256, string[] tags)
        {
            Id = id;
            FileName = fileName;
            EventName = eventName;
            Bus = bus;
            Duration = duration;
            Sha256 = sha256;
            Tags = tags;
        }
    }

    public static class PackGenerator
    {
        private const int SampleRate = 44100;
        private const string AssetVersion = "20260618-procedural-crystal-a";
        private static readonly List<AssetInfo> Assets = new List<AssetInfo>();
        private static string PackRoot = "";
        private static string AudioRoot = "";

        public static void Generate(string packRoot)
        {
            PackRoot = packRoot;
            AudioRoot = Path.Combine(PackRoot, "audio");
            Directory.CreateDirectory(AudioRoot);
            Assets.Clear();

            GenerateMusic();
            GenerateStoneSounds();
            GenerateSystemSounds();
            GenerateOutcomeSounds();
            GenerateChecksums();
            GenerateManifest();
        }

        private static void GenerateMusic()
        {
            StereoBuffer bgm = new StereoBuffer(32.0, SampleRate);
            double[][] chords = new double[][]
            {
                Frequencies(new double[] { 48, 52, 55, 59, 62 }),
                Frequencies(new double[] { 43, 50, 55, 59, 62 }),
                Frequencies(new double[] { 45, 52, 57, 60, 64 }),
                Frequencies(new double[] { 41, 48, 52, 55, 60 })
            };

            double[] chordStarts = new double[] { -10.0, -2.0, 6.0, 14.0, 22.0, 30.0 };
            int[] chordOrder = new int[] { 3, 0, 1, 2, 3, 0 };
            double[] rootFreqs = new double[] { Midi(29), Midi(36), Midi(31), Midi(33), Midi(29), Midi(36) };
            for (int i = 0; i < chordStarts.Length; i++)
            {
                AddPadChord(bgm, chordStarts[i], 10.8, chords[chordOrder[i]], 0.052, i);
                AddSoftRoot(bgm, chordStarts[i], 10.2, rootFreqs[i], 0.043, i % 2 == 0 ? -0.12 : 0.1);
            }

            Random rng = new Random(91427);
            for (int i = 0; i < 18; i++)
            {
                double start = 0.8 + rng.NextDouble() * 31.0;
                if (rng.NextDouble() < 0.46) start += 0.22 + rng.NextDouble() * 0.65;
                double[] scale = new double[] { Midi(72), Midi(74), Midi(76), Midi(79), Midi(81), Midi(83), Midi(86) };
                double freq = scale[rng.Next(scale.Length)] * (0.992 + rng.NextDouble() * 0.019);
                double chimeDuration = 2.2 + rng.NextDouble() * 1.4;
                AddLoopedCrystalBell(bgm, start, freq, chimeDuration, 0.025 + rng.NextDouble() * 0.018, -0.72 + rng.NextDouble() * 1.44, rng, 1.18, 32.0);
                if (rng.NextDouble() < 0.42)
                {
                    AddLoopedCrystalBell(bgm, start + 0.09 + rng.NextDouble() * 0.32, freq * 1.5, 1.55, 0.014, -0.72 + rng.NextDouble() * 1.44, rng, 1.35, 32.0);
                }
            }

            AddCyclicWideDelay(bgm, 0.42, 0.19);
            ApplyBoundaryFade(bgm, 0.06);
            SaveAsset("bgm-main", "bgm-crystal-major-loop.wav", "music.game", "music", bgm, 0.86, new string[] { "bgm", "major", "loop", "airy", "wind-chime" });
        }

        private static void GenerateStoneSounds()
        {
            for (int i = 1; i <= 3; i++)
            {
                Random rng = new Random(3000 + i);
                StereoBuffer b = new StereoBuffer(0.48, SampleRate);
                AddChirp(b, 0.012, 0.16, 860 + i * 75, 1320 + i * 115, 0.075, -0.22 + rng.NextDouble() * 0.44);
                AddCrystalBell(b, 0.035, 980 + i * 86, 0.42, 0.055, -0.28 + rng.NextDouble() * 0.56, rng, 1.24);
                AddCrystalBell(b, 0.09, 1540 + i * 111, 0.32, 0.024, -0.18 + rng.NextDouble() * 0.36, rng, 1.48);
                AddWideDelay(b, 0.072, 0.18);
                SaveAsset("pickup-0" + i.ToString(CultureInfo.InvariantCulture), "stone-pickup-0" + i.ToString(CultureInfo.InvariantCulture) + ".wav", "stone.pickup", "sfx", b, 0.84, new string[] { "stone", "pickup", "crystal" });
            }

            for (int i = 1; i <= 3; i++)
            {
                Random rng = new Random(4100 + i);
                StereoBuffer b = new StereoBuffer(0.58, SampleRate);
                AddWoodTransient(b, 0.0, 0.11, 0.035, 210 + i * 18, -0.1 + rng.NextDouble() * 0.2);
                AddCrystalBell(b, 0.018, 690 + i * 72, 0.5, 0.078, -0.3 + rng.NextDouble() * 0.6, rng, 1.0);
                AddCrystalBell(b, 0.048, 1120 + i * 65, 0.34, 0.032, -0.22 + rng.NextDouble() * 0.44, rng, 1.18);
                AddWideDelay(b, 0.086, 0.13);
                SaveAsset("drop-pit-0" + i.ToString(CultureInfo.InvariantCulture), "stone-drop-pit-0" + i.ToString(CultureInfo.InvariantCulture) + ".wav", "stone.drop.pit", "sfx", b, 0.82, new string[] { "stone", "drop", "pit", "crystal" });
            }

            for (int i = 1; i <= 2; i++)
            {
                Random rng = new Random(5200 + i);
                StereoBuffer b = new StereoBuffer(0.78, SampleRate);
                AddWoodTransient(b, 0.0, 0.16, 0.045, 150 + i * 24, -0.08 + rng.NextDouble() * 0.16);
                AddCrystalBell(b, 0.025, 520 + i * 57, 0.75, 0.092, -0.18 + rng.NextDouble() * 0.36, rng, 0.92);
                AddCrystalBell(b, 0.09, 780 + i * 85, 0.62, 0.052, -0.24 + rng.NextDouble() * 0.48, rng, 1.1);
                AddCrystalBell(b, 0.16, 1160 + i * 103, 0.46, 0.025, -0.22 + rng.NextDouble() * 0.44, rng, 1.32);
                AddWideDelay(b, 0.105, 0.17);
                SaveAsset("drop-store-0" + i.ToString(CultureInfo.InvariantCulture), "stone-drop-store-0" + i.ToString(CultureInfo.InvariantCulture) + ".wav", "stone.drop.store", "sfx", b, 0.84, new string[] { "stone", "drop", "store", "crystal" });
            }

            for (int i = 1; i <= 3; i++)
            {
                Random rng = new Random(6300 + i);
                StereoBuffer b = new StereoBuffer(0.42 + i * 0.035, SampleRate);
                AddCrystalBell(b, 0.006, 1180 + rng.NextDouble() * 340, 0.38, 0.07, -0.55 + rng.NextDouble() * 1.1, rng, 1.48);
                AddCrystalBell(b, 0.036 + rng.NextDouble() * 0.018, 1620 + rng.NextDouble() * 520, 0.26, 0.035, -0.55 + rng.NextDouble() * 1.1, rng, 1.7);
                if (i == 3)
                {
                    AddCrystalBell(b, 0.086, 2310, 0.22, 0.025, 0.24, rng, 1.9);
                }
                AddWideDelay(b, 0.058, 0.16);
                SaveAsset("collision-0" + i.ToString(CultureInfo.InvariantCulture), "stone-collision-0" + i.ToString(CultureInfo.InvariantCulture) + ".wav", "stone.collision", "sfx", b, 0.8, new string[] { "stone", "collision", "crystal", "random-variant" });
            }

            {
                Random rng = new Random(7401);
                StereoBuffer b = new StereoBuffer(1.45, SampleRate);
                AddCrystalBell(b, 0.02, 620, 0.75, 0.072, -0.35, rng, 1.0);
                AddCrystalBell(b, 0.12, 930, 0.82, 0.057, 0.18, rng, 1.22);
                AddCrystalBell(b, 0.27, 1240, 0.86, 0.045, -0.05, rng, 1.45);
                AddChirp(b, 0.34, 0.62, 850, 1720, 0.038, 0.28);
                AddWideDelay(b, 0.112, 0.22);
                SaveAsset("capture-01", "stone-capture-crystal-01.wav", "stone.capture", "sfx", b, 0.86, new string[] { "stone", "capture", "crystal", "sweep" });
            }
        }

        private static void GenerateSystemSounds()
        {
            for (int i = 1; i <= 3; i++)
            {
                Random rng = new Random(8100 + i);
                StereoBuffer b = new StereoBuffer(0.2, SampleRate);
                AddWoodTransient(b, 0.0, 0.16, 0.088, 92 + i * 12, -0.08 + rng.NextDouble() * 0.16);
                AddWoodTransient(b, 0.012, 0.12, 0.032, 210 + i * 24, -0.05 + rng.NextDouble() * 0.1);
                SaveAsset("ui-button-0" + i.ToString(CultureInfo.InvariantCulture), "ui-button-wood-0" + i.ToString(CultureInfo.InvariantCulture) + ".wav", "ui.button", "sfx", b, 0.76, new string[] { "ui", "button", "wood", "short" });
            }

            {
                StereoBuffer b = new StereoBuffer(0.18, SampleRate);
                Random rng = new Random(8260);
                AddWoodTransient(b, 0.0, 0.12, 0.043, 72, -0.04);
                AddCrystalBell(b, 0.024, 420, 0.14, 0.016, 0.1, rng, 0.5);
                SaveAsset("ui-invalid-01", "ui-invalid-muted-01.wav", "ui.invalid", "sfx", b, 0.72, new string[] { "ui", "invalid", "muted" });
            }

            {
                StereoBuffer b = new StereoBuffer(1.55, SampleRate);
                Random rng = new Random(8350);
                for (int i = 0; i < 17; i++)
                {
                    double p = i / 16.0;
                    double start = 0.03 + p * p * 1.18;
                    AddCrystalBell(b, start, 820 + i * 41, 0.22 + p * 0.16, 0.028 * (1.0 - p * 0.35), -0.35 + rng.NextDouble() * 0.7, rng, 1.55);
                    AddWoodTransient(b, start, 0.06, 0.012, 310 + i * 9, -0.22 + rng.NextDouble() * 0.44);
                }
                AddWideDelay(b, 0.055, 0.15);
                SaveAsset("coin-toss-01", "coin-toss-crystal-spin-01.wav", "coin.toss", "sfx", b, 0.82, new string[] { "coin", "toss", "spin", "crystal" });
            }

            {
                StereoBuffer b = new StereoBuffer(0.82, SampleRate);
                Random rng = new Random(8460);
                AddCrystalBell(b, 0.02, Midi(76), 0.62, 0.046, -0.18, rng, 1.35);
                AddCrystalBell(b, 0.12, Midi(83), 0.5, 0.032, 0.18, rng, 1.5);
                AddWideDelay(b, 0.086, 0.18);
                SaveAsset("turn-change-01", "turn-change-chime-01.wav", "turn.change", "sfx", b, 0.78, new string[] { "turn", "chime", "crystal" });
            }

            {
                StereoBuffer b = new StereoBuffer(1.18, SampleRate);
                Random rng = new Random(8570);
                AddCrystalBell(b, 0.02, Midi(72), 0.7, 0.05, -0.22, rng, 1.25);
                AddCrystalBell(b, 0.17, Midi(79), 0.72, 0.046, 0.05, rng, 1.4);
                AddCrystalBell(b, 0.35, Midi(84), 0.75, 0.037, 0.24, rng, 1.58);
                AddWideDelay(b, 0.092, 0.2);
                SaveAsset("extra-turn-01", "turn-extra-crystal-01.wav", "turn.extra", "sfx", b, 0.84, new string[] { "turn", "extra", "up", "crystal" });
            }
        }

        private static void GenerateOutcomeSounds()
        {
            {
                StereoBuffer b = new StereoBuffer(4.25, SampleRate);
                Random rng = new Random(9101);
                double[] notes = new double[] { Midi(60), Midi(64), Midi(67), Midi(72), Midi(76), Midi(79), Midi(84) };
                for (int i = 0; i < notes.Length; i++)
                {
                    AddCrystalBell(b, 0.05 + i * 0.22, notes[i], 1.65, 0.052 - i * 0.003, -0.48 + i * 0.16, rng, 1.48);
                }
                AddPadChord(b, 1.35, 2.6, Frequencies(new double[] { 60, 64, 67, 71, 74, 79 }), 0.05, 3);
                AddCrystalBell(b, 2.55, Midi(88), 1.15, 0.033, 0.28, rng, 1.75);
                AddWideDelay(b, 0.14, 0.24);
                SaveAsset("result-victory-01", "result-victory-crystal-upbeat-01.wav", "result.victory", "sfx", b, 0.88, new string[] { "result", "victory", "upbeat", "crystal" });
            }

            {
                StereoBuffer b = new StereoBuffer(4.15, SampleRate);
                Random rng = new Random(9201);
                double[] notes = new double[] { Midi(72), Midi(69), Midi(65), Midi(60), Midi(57), Midi(52) };
                for (int i = 0; i < notes.Length; i++)
                {
                    AddCrystalBell(b, 0.08 + i * 0.34, notes[i], 1.4, 0.045 - i * 0.003, 0.38 - i * 0.14, rng, 0.98);
                }
                AddPadChord(b, 1.35, 2.5, Frequencies(new double[] { 45, 52, 57, 60 }), 0.038, 1);
                AddWideDelay(b, 0.16, 0.2);
                SaveAsset("result-defeat-01", "result-defeat-crystal-downbeat-01.wav", "result.defeat", "sfx", b, 0.84, new string[] { "result", "defeat", "downbeat", "crystal" });
            }

            {
                StereoBuffer b = new StereoBuffer(3.55, SampleRate);
                Random rng = new Random(9301);
                double[] chord = Frequencies(new double[] { 53, 60, 64, 67, 71, 74 });
                AddPadChord(b, 0.06, 3.22, chord, 0.044, 2);
                AddCrystalBell(b, 0.15, Midi(72), 1.6, 0.038, -0.25, rng, 1.2);
                AddCrystalBell(b, 0.55, Midi(76), 1.7, 0.032, 0.18, rng, 1.25);
                AddCrystalBell(b, 0.95, Midi(79), 1.85, 0.028, 0.02, rng, 1.2);
                AddWideDelay(b, 0.14, 0.24);
                SaveAsset("result-draw-01", "result-draw-crystal-chord-01.wav", "result.draw", "sfx", b, 0.84, new string[] { "result", "draw", "chord", "crystal" });
            }
        }

        private static void AddPadChord(StereoBuffer b, double start, double duration, double[] freqs, double amp, int color)
        {
            int s0 = (int)Math.Round(start * SampleRate);
            int count = (int)Math.Round(duration * SampleRate);
            for (int i = 0; i < count; i++)
            {
                int idx = s0 + i;
                if (idx < 0 || idx >= b.Length) continue;
                double t = i / (double)SampleRate;
                double globalT = t;
                double env = AttackRelease(t, duration, 2.4, 2.2);
                double left = 0.0;
                double right = 0.0;
                for (int n = 0; n < freqs.Length; n++)
                {
                    double pan = -0.46 + (0.92 * n / Math.Max(1.0, freqs.Length - 1.0));
                    double vibrato = 1.0 + 0.0018 * Math.Sin(2.0 * Math.PI * (0.038 + n * 0.006) * globalT + color + n * 0.7);
                    double f = freqs[n] * vibrato;
                    double phase = 2.0 * Math.PI * f * t;
                    double voice = Math.Sin(phase) * 0.54 + Math.Sin(phase * 2.0 + 0.4) * 0.12 + Math.Sin(phase * 3.0 + 1.1) * 0.035;
                    double voiceAmp = amp * env / Math.Sqrt(freqs.Length);
                    double angle = (StereoBuffer.Clamp(pan, -1.0, 1.0) + 1.0) * Math.PI / 4.0;
                    left += voice * voiceAmp * Math.Cos(angle);
                    right += voice * voiceAmp * Math.Sin(angle);
                }
                b.AddMono(idx, left, right);
            }
        }

        private static void AddSoftRoot(StereoBuffer b, double start, double duration, double freq, double amp, double pan)
        {
            int s0 = (int)Math.Round(start * SampleRate);
            int count = (int)Math.Round(duration * SampleRate);
            for (int i = 0; i < count; i++)
            {
                int idx = s0 + i;
                if (idx < 0 || idx >= b.Length) continue;
                double t = i / (double)SampleRate;
                double env = AttackRelease(t, duration, 1.8, 2.0);
                double v = Math.Sin(2.0 * Math.PI * freq * t) * 0.72 + Math.Sin(2.0 * Math.PI * freq * 2.0 * t) * 0.16;
                b.Add(idx, v * amp * env, pan);
            }
        }

        private static void AddCrystalBell(StereoBuffer b, double start, double freq, double duration, double amp, double pan, Random rng, double brightness)
        {
            double[] detune = CreateBellDetune(rng);
            AddCrystalBellWithDetune(b, start, freq, duration, amp, pan, brightness, detune);
        }

        private static void AddCrystalBellWithDetune(StereoBuffer b, double start, double freq, double duration, double amp, double pan, double brightness, double[] detune)
        {
            double[] ratios = new double[] { 1.0, 2.006, 2.714, 3.932, 5.401, 6.817 };
            double[] gains = new double[] { 1.0, 0.48, 0.33, 0.18, 0.12, 0.08 };
            int s0 = (int)Math.Round(start * SampleRate);
            int count = (int)Math.Round(duration * SampleRate);
            for (int i = 0; i < count; i++)
            {
                int idx = s0 + i;
                if (idx < 0 || idx >= b.Length) continue;
                double t = i / (double)SampleRate;
                double attack = 1.0 - Math.Exp(-t / 0.0035);
                double value = 0.0;
                for (int p = 0; p < ratios.Length; p++)
                {
                    double decay = Math.Exp(-t * (1.8 + p * 0.82) / Math.Max(0.42, brightness));
                    double phase = 2.0 * Math.PI * freq * ratios[p] * detune[p] * t;
                    value += Math.Sin(phase) * gains[p] * decay;
                }
                double shimmer = Math.Sin(2.0 * Math.PI * freq * 1.003 * t + 0.71) * Math.Exp(-t * 3.2) * 0.12;
                b.Add(idx, (value + shimmer) * amp * attack, pan);
            }
        }

        private static void AddLoopedCrystalBell(StereoBuffer b, double start, double freq, double duration, double amp, double pan, Random rng, double brightness, double loopSeconds)
        {
            double[] detune = CreateBellDetune(rng);
            AddCrystalBellWithDetune(b, start, freq, duration, amp, pan, brightness, detune);
            if (start + duration > loopSeconds)
            {
                AddCrystalBellWithDetune(b, start - loopSeconds, freq, duration, amp, pan, brightness, detune);
            }
            if (start < duration)
            {
                AddCrystalBellWithDetune(b, start + loopSeconds, freq, duration, amp, pan, brightness, detune);
            }
        }

        private static double[] CreateBellDetune(Random rng)
        {
            double[] detune = new double[6];
            for (int p = 0; p < detune.Length; p++)
            {
                detune[p] = 1.0 + (rng.NextDouble() - 0.5) * 0.006;
            }
            return detune;
        }

        private static void AddChirp(StereoBuffer b, double start, double duration, double startFreq, double endFreq, double amp, double pan)
        {
            int s0 = (int)Math.Round(start * SampleRate);
            int count = (int)Math.Round(duration * SampleRate);
            double phase = 0.0;
            for (int i = 0; i < count; i++)
            {
                int idx = s0 + i;
                if (idx < 0 || idx >= b.Length) continue;
                double p = i / Math.Max(1.0, count - 1.0);
                double t = i / (double)SampleRate;
                double freq = startFreq + (endFreq - startFreq) * Smooth(p);
                phase += 2.0 * Math.PI * freq / SampleRate;
                double env = AttackRelease(t, duration, 0.012, 0.07);
                b.Add(idx, Math.Sin(phase) * amp * env, pan);
            }
        }

        private static void AddWoodTransient(StereoBuffer b, double start, double duration, double amp, double baseFreq, double pan)
        {
            int s0 = (int)Math.Round(start * SampleRate);
            int count = (int)Math.Round(duration * SampleRate);
            Random rng = new Random((int)(baseFreq * 97 + duration * 10000));
            double noise = 0.0;
            for (int i = 0; i < count; i++)
            {
                int idx = s0 + i;
                if (idx < 0 || idx >= b.Length) continue;
                double t = i / (double)SampleRate;
                double env = Math.Exp(-t * 32.0) * (1.0 - Math.Exp(-t / 0.0022));
                noise = noise * 0.62 + (rng.NextDouble() * 2.0 - 1.0) * 0.38;
                double tone =
                    Math.Sin(2.0 * Math.PI * baseFreq * t) * 0.75 +
                    Math.Sin(2.0 * Math.PI * baseFreq * 1.87 * t + 0.4) * 0.28 +
                    Math.Sin(2.0 * Math.PI * baseFreq * 2.94 * t + 1.2) * 0.12;
                b.Add(idx, (tone + noise * 0.26) * amp * env, pan);
            }
        }

        private static void AddWideDelay(StereoBuffer b, double delaySeconds, double feedback)
        {
            int delay = Math.Max(1, (int)Math.Round(delaySeconds * SampleRate));
            for (int i = delay; i < b.Length; i++)
            {
                double delayedLeft = b.Right[i - delay] * feedback;
                double delayedRight = b.Left[i - delay] * feedback * 0.92;
                b.Left[i] += delayedLeft;
                b.Right[i] += delayedRight;
            }
        }

        private static void AddCyclicWideDelay(StereoBuffer b, double delaySeconds, double feedback)
        {
            int delay = Math.Max(1, (int)Math.Round(delaySeconds * SampleRate));
            double[] left = new double[b.Length];
            double[] right = new double[b.Length];
            Array.Copy(b.Left, left, b.Length);
            Array.Copy(b.Right, right, b.Length);
            for (int i = 0; i < b.Length; i++)
            {
                int source = i - delay;
                while (source < 0) source += b.Length;
                b.Left[i] += right[source] * feedback;
                b.Right[i] += left[source] * feedback * 0.92;
            }
        }

        private static void ApplyBoundaryFade(StereoBuffer b, double seconds)
        {
            int count = Math.Min(b.Length / 2, Math.Max(1, (int)Math.Round(seconds * SampleRate)));
            for (int i = 0; i < count; i++)
            {
                double p = i / Math.Max(1.0, count - 1.0);
                double fadeIn = Smooth(p);
                double fadeOut = Smooth(1.0 - p);
                int end = b.Length - count + i;
                b.Left[i] *= fadeIn;
                b.Right[i] *= fadeIn;
                b.Left[end] *= fadeOut;
                b.Right[end] *= fadeOut;
            }
        }

        private static double AttackRelease(double t, double duration, double attack, double release)
        {
            if (t < 0.0 || t > duration) return 0.0;
            double a = attack <= 0.0 ? 1.0 : StereoBuffer.Clamp(t / attack, 0.0, 1.0);
            double r = release <= 0.0 ? 1.0 : StereoBuffer.Clamp((duration - t) / release, 0.0, 1.0);
            return Smooth(a) * Smooth(r);
        }

        private static double Smooth(double x)
        {
            x = StereoBuffer.Clamp(x, 0.0, 1.0);
            return x * x * (3.0 - 2.0 * x);
        }

        private static double Midi(double midiNote)
        {
            return 440.0 * Math.Pow(2.0, (midiNote - 69.0) / 12.0);
        }

        private static double[] Frequencies(double[] midiNotes)
        {
            double[] result = new double[midiNotes.Length];
            for (int i = 0; i < midiNotes.Length; i++)
            {
                result[i] = Midi(midiNotes[i]);
            }
            return result;
        }

        private static void SaveAsset(string id, string fileName, string eventName, string bus, StereoBuffer buffer, double targetPeak, string[] tags)
        {
            string path = Path.Combine(AudioRoot, fileName);
            WriteWav(path, buffer, targetPeak);
            string sha = Sha256(path);
            Assets.Add(new AssetInfo(id, fileName, eventName, bus, buffer.Length / (double)SampleRate, sha, tags));
            Console.WriteLine(fileName + " " + sha);
        }

        private static void WriteWav(string path, StereoBuffer b, double targetPeak)
        {
            double peak = 0.000001;
            for (int i = 0; i < b.Length; i++)
            {
                double l = Math.Abs(b.Left[i]);
                double r = Math.Abs(b.Right[i]);
                if (l > peak) peak = l;
                if (r > peak) peak = r;
            }

            double gain = targetPeak / peak;
            int dataBytes = b.Length * 2 * 2;

            using (FileStream fs = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None))
            using (BinaryWriter w = new BinaryWriter(fs))
            {
                w.Write(Encoding.ASCII.GetBytes("RIFF"));
                w.Write(36 + dataBytes);
                w.Write(Encoding.ASCII.GetBytes("WAVE"));
                w.Write(Encoding.ASCII.GetBytes("fmt "));
                w.Write(16);
                w.Write((short)1);
                w.Write((short)2);
                w.Write(SampleRate);
                w.Write(SampleRate * 2 * 2);
                w.Write((short)4);
                w.Write((short)16);
                w.Write(Encoding.ASCII.GetBytes("data"));
                w.Write(dataBytes);

                for (int i = 0; i < b.Length; i++)
                {
                    short left = ToInt16(b.Left[i] * gain);
                    short right = ToInt16(b.Right[i] * gain);
                    w.Write(left);
                    w.Write(right);
                }
            }
        }

        private static short ToInt16(double value)
        {
            value = StereoBuffer.Clamp(value, -0.999, 0.999);
            return (short)Math.Round(value * 32767.0);
        }

        private static string Sha256(string path)
        {
            using (FileStream fs = File.OpenRead(path))
            using (SHA256 sha = SHA256.Create())
            {
                byte[] hash = sha.ComputeHash(fs);
                StringBuilder sb = new StringBuilder(hash.Length * 2);
                for (int i = 0; i < hash.Length; i++)
                {
                    sb.Append(hash[i].ToString("x2", CultureInfo.InvariantCulture));
                }
                return sb.ToString();
            }
        }

        private static void GenerateChecksums()
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Assets.Count; i++)
            {
                AssetInfo a = Assets[i];
                sb.Append(a.Sha256).Append("  audio/").Append(a.FileName).Append("\n");
            }
            File.WriteAllText(Path.Combine(PackRoot, "checksums.sha256"), sb.ToString(), new UTF8Encoding(false));
        }

        private static void GenerateManifest()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("{\n");
            AppendField(sb, 1, "schemaVersion", "1", false, true);
            AppendField(sb, 1, "id", "procedural-crystal", true, true);
            AppendField(sb, 1, "displayName", "Procedural Crystal", true, true);
            AppendField(sb, 1, "assetVersion", AssetVersion, true, true);
            AppendField(sb, 1, "baseUrl", "./audio/", true, true);
            AppendField(sb, 1, "format", "wav/pcm-s16le", true, true);
            AppendField(sb, 1, "sampleRate", SampleRate.ToString(CultureInfo.InvariantCulture), false, true);
            AppendField(sb, 1, "channels", "2", false, true);
            sb.Append("  \"generator\": {\n");
            AppendField(sb, 2, "name", "generate-pack.ps1", true, true);
            AppendField(sb, 2, "method", "deterministic procedural synthesis; no third-party samples", true, false);
            sb.Append("  },\n");
            sb.Append("  \"compliance\": {\n");
            AppendField(sb, 2, "thirdPartySamples", "false", false, true);
            AppendField(sb, 2, "commercialUseIntended", "true", false, true);
            AppendField(sb, 2, "attributionRequired", "false", false, true);
            AppendField(sb, 2, "source", "procedural-generated", true, true);
            AppendField(sb, 2, "licenseNote", "Generated from source code in this pack. Keep SOUND_LICENSE.md with redistributed files.", true, false);
            sb.Append("  },\n");
            sb.Append("  \"buses\": {\n");
            sb.Append("    \"music\": { \"volume\": 0.42, \"loop\": true },\n");
            sb.Append("    \"sfx\": { \"volume\": 0.82, \"polyphony\": 8 }\n");
            sb.Append("  },\n");
            sb.Append("  \"assets\": {\n");
            for (int i = 0; i < Assets.Count; i++)
            {
                AssetInfo a = Assets[i];
                sb.Append("    \"").Append(Json(a.Id)).Append("\": {\n");
                AppendField(sb, 3, "src", a.FileName, true, true);
                AppendField(sb, 3, "type", "audio/wav", true, true);
                AppendField(sb, 3, "durationMs", Math.Round(a.Duration * 1000.0).ToString(CultureInfo.InvariantCulture), false, true);
                AppendField(sb, 3, "sha256", a.Sha256, true, true);
                sb.Append("      \"tags\": [");
                for (int t = 0; t < a.Tags.Length; t++)
                {
                    if (t > 0) sb.Append(", ");
                    sb.Append("\"").Append(Json(a.Tags[t])).Append("\"");
                }
                sb.Append("]\n");
                sb.Append("    }");
                if (i < Assets.Count - 1) sb.Append(",");
                sb.Append("\n");
            }
            sb.Append("  },\n");
            GenerateEvents(sb);
            sb.Append("}\n");
            File.WriteAllText(Path.Combine(PackRoot, "manifest.json"), sb.ToString(), new UTF8Encoding(false));
        }

        private static void GenerateEvents(StringBuilder sb)
        {
            sb.Append("  \"events\": {\n");
            AppendEvent(sb, "music.game", new string[] { "bgm-main" }, "music", true, 800, 1200, false, 1.0, true);
            AppendEvent(sb, "stone.pickup", new string[] { "pickup-01", "pickup-02", "pickup-03" }, "sfx", false, 0, 0, true, 0.9, true);
            AppendEvent(sb, "stone.drop.pit", new string[] { "drop-pit-01", "drop-pit-02", "drop-pit-03" }, "sfx", false, 0, 0, true, 0.82, true);
            AppendEvent(sb, "stone.drop.store", new string[] { "drop-store-01", "drop-store-02" }, "sfx", false, 0, 0, true, 0.88, true);
            AppendEvent(sb, "stone.collision", new string[] { "collision-01", "collision-02", "collision-03" }, "sfx", false, 0, 0, true, 0.72, true);
            AppendEvent(sb, "stone.capture", new string[] { "capture-01" }, "sfx", false, 0, 0, false, 0.92, true);
            AppendEvent(sb, "turn.change", new string[] { "turn-change-01" }, "sfx", false, 0, 0, false, 0.7, true);
            AppendEvent(sb, "turn.extra", new string[] { "extra-turn-01" }, "sfx", false, 0, 0, false, 0.82, true);
            AppendEvent(sb, "coin.toss", new string[] { "coin-toss-01" }, "sfx", false, 0, 0, false, 0.78, true);
            AppendEvent(sb, "ui.button", new string[] { "ui-button-01", "ui-button-02", "ui-button-03" }, "sfx", false, 0, 0, true, 0.72, true);
            AppendEvent(sb, "ui.invalid", new string[] { "ui-invalid-01" }, "sfx", false, 0, 0, false, 0.64, true);
            AppendEvent(sb, "result.victory", new string[] { "result-victory-01" }, "sfx", false, 0, 0, false, 0.88, true);
            AppendEvent(sb, "result.defeat", new string[] { "result-defeat-01" }, "sfx", false, 0, 0, false, 0.84, true);
            AppendEvent(sb, "result.draw", new string[] { "result-draw-01" }, "sfx", false, 0, 0, false, 0.82, false);
            sb.Append("\n  }\n");
        }

        private static void AppendEvent(StringBuilder sb, string name, string[] variants, string bus, bool loop, int fadeInMs, int fadeOutMs, bool randomize, double volume, bool commaAfter)
        {
            sb.Append("    \"").Append(Json(name)).Append("\": {\n");
            sb.Append("      \"variants\": [");
            for (int i = 0; i < variants.Length; i++)
            {
                if (i > 0) sb.Append(", ");
                sb.Append("\"").Append(Json(variants[i])).Append("\"");
            }
            sb.Append("],\n");
            AppendField(sb, 3, "bus", bus, true, true);
            AppendField(sb, 3, "loop", loop ? "true" : "false", false, true);
            AppendField(sb, 3, "volume", volume.ToString("0.###", CultureInfo.InvariantCulture), false, true);
            AppendField(sb, 3, "randomizeVariant", randomize ? "true" : "false", false, true);
            AppendField(sb, 3, "pitchRange", randomize ? "[0.96, 1.04]" : "[1, 1]", false, true);
            AppendField(sb, 3, "cooldownMs", name == "stone.collision" ? "25" : "0", false, true);
            AppendField(sb, 3, "fadeInMs", fadeInMs.ToString(CultureInfo.InvariantCulture), false, true);
            AppendField(sb, 3, "fadeOutMs", fadeOutMs.ToString(CultureInfo.InvariantCulture), false, false);
            sb.Append("    }");
            if (commaAfter) sb.Append(",");
            sb.Append("\n");
        }

        private static void AppendField(StringBuilder sb, int indent, string name, string value, bool quote, bool comma)
        {
            for (int i = 0; i < indent; i++) sb.Append("  ");
            sb.Append("\"").Append(Json(name)).Append("\": ");
            if (quote) sb.Append("\"").Append(Json(value)).Append("\"");
            else sb.Append(value);
            if (comma) sb.Append(",");
            sb.Append("\n");
        }

        private static string Json(string value)
        {
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }
    }
}
"@

Add-Type -TypeDefinition $source -Language CSharp
[ProceduralCrystalAudio.PackGenerator]::Generate($packRoot)
