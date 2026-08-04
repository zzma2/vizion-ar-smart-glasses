export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkHistoryItem {
  time: number;
  landmarks: Point3D[];
}

export class MediaPipeASLClassifier {
  dist(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  detectPhrase(rawLandmarks: Point3D[], history: LandmarkHistoryItem[] = []): string | null {
    if (!rawLandmarks || rawLandmarks.length < 21 || !history || history.length < 3) return null;

    const wrist = rawLandmarks[0];
    const indexTip = rawLandmarks[8], middleTip = rawLandmarks[12], ringTip = rawLandmarks[16], pinkyTip = rawLandmarks[20];
    const middleMCP = rawLandmarks[9];

    const handScale = Math.max(
      Math.sqrt(Math.pow(wrist.x - middleMCP.x, 2) + Math.pow(wrist.y - middleMCP.y, 2)),
      0.05
    );

    const extIndex = Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)) / handScale;
    const extMiddle = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2)) / handScale;
    const extRing = Math.sqrt(Math.pow(ringTip.x - wrist.x, 2) + Math.pow(ringTip.y - wrist.y, 2)) / handScale;
    const extPinky = Math.sqrt(Math.pow(pinkyTip.x - wrist.x, 2) + Math.pow(pinkyTip.y - wrist.y, 2)) / handScale;

    const isFlatOpenHand = extIndex > 1.15 && extMiddle > 1.15 && extRing > 1.10 && extPinky > 1.05;
    if (!isFlatOpenHand) return null;

    const oldest = history[0].landmarks;
    if (!oldest || oldest.length < 21) return null;

    const deltaX = indexTip.x - oldest[8].x;
    const deltaY = indexTip.y - oldest[8].y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 1. "HELLO" - Open B-hand starting at temple/head height, moving DOMINANTLY HORIZONTALLY (absDeltaX > absDeltaY * 1.3)
    if (wrist.y < 0.52 && absDeltaX > 0.065 && absDeltaX > absDeltaY * 1.3) {
      return 'HELLO';
    }

    // 2. "THANK YOU" - Open B-hand starting at chin/lips level (oldest[12].y >= 0.45), moving DOMINANTLY DOWNWARDS (deltaY > absDeltaX * 1.3)
    if (oldest[12].y >= 0.45 && deltaY > 0.095 && deltaY > absDeltaX * 1.3) {
      return 'THANK YOU';
    }

    return null;
  }

  classifyLandmarks(
    rawLandmarks: Point3D[],
    isRearCamera = false,
    history: LandmarkHistoryItem[] = [],
    videoWidth = 1280,
    videoHeight = 720
  ): string {
    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    const phrase = this.detectPhrase(rawLandmarks, history);
    if (phrase) return phrase;

    const isMobile =
      typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768);

    if (!isMobile) {
      const isMirroredHand = rawLandmarks[2].x > rawLandmarks[17].x;
      const landmarks = isMirroredHand
        ? rawLandmarks.map((p) => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
        : rawLandmarks;
      return this.classifyDesktopLandmarks(landmarks, history);
    }

    return this.classifyMobileLandmarks(rawLandmarks, isRearCamera, history, videoWidth, videoHeight);
  }

  classifyDesktopLandmarks(landmarks: Point3D[], history: LandmarkHistoryItem[] = []): string {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.30;
    const isMiddleStraight = extMiddle > 1.30;
    const isRingStraight = extRing > 1.30;
    const isPinkyStraight = extPinky > 1.30;

    const isIndexOpen = extIndex > 1.08;
    const isMiddleOpen = extMiddle > 1.08;
    const isRingOpen = extRing > 1.08;
    const isPinkyOpen = extPinky > 0.98;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;
    const normIndexMiddle = this.dist(indexTip, middleTip) / handScale;

    const isPointingDown = isIndexOpen && indexTip.y > wrist.y + 0.12 * handScale && indexTip.y > indexMCP.y + 0.12 * handScale;
    const isHorizontal = Math.abs(indexTip.y - indexMCP.y) < 0.3 * handScale && Math.abs(indexTip.x - indexMCP.x) > 0.35 * handScale;
    const isIndexHooked = this.dist(indexTip, wrist) < 0.95 * this.dist(indexPIP, wrist) || (indexTip.y > indexDIP.y && indexTip.y > indexPIP.y);

    let indexDisplacementX = 0, indexDisplacementY = 0;
    let pinkyDisplacementX = 0, pinkyDisplacementY = 0;

    if (history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest.length >= 21) {
        indexDisplacementX = Math.abs(indexTip.x - oldest[8].x);
        indexDisplacementY = Math.abs(indexTip.y - oldest[8].y);
        pinkyDisplacementX = Math.abs(pinkyTip.x - oldest[20].x);
        pinkyDisplacementY = Math.abs(pinkyTip.y - oldest[20].y);
      }
    }

    let detected = 'A';

    if (isPointingDown && isIndexOpen) {
      if (isMiddleOpen) detected = 'P';
      else detected = 'Q';
    } else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleOpen && normIndexMiddle < 0.35) detected = 'H';
      else detected = 'G';
    } else if (
      normThumbIndex >= 0.38 && normThumbIndex <= 1.25 &&
      normThumbMiddle >= 0.38 && normThumbMiddle <= 1.25 &&
      extIndex >= 1.05 && extMiddle >= 1.05 &&
      extRing >= 0.75 && !isPointingDown
    ) {
      detected = 'C';
    } else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      if (distThumbMiddlePIP < 0.32 && distThumbIndexPIP < 0.36 && Math.abs(thumbTip.y - thumbIP.y) < 0.16 * handScale && thumbTip.z <= indexPIP.z + 0.02) {
        detected = 'S';
      } else if (normThumbIndex < 0.22 && normThumbMiddle < 0.22 && extIndex >= 0.85) {
        detected = 'E';
      } else if (distThumbPinkyMCP < 0.34 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.32)) {
        detected = 'M';
      } else if (distThumbRingMCP < 0.32 && distThumbMiddleMCP < distThumbPinkyMCP) {
        detected = 'N';
      } else if (distThumbMiddleMCP < 0.34 && distThumbIndexMCP < distThumbRingMCP) {
        detected = 'T';
      } else {
        detected = 'A';
      }
    } else if (isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    } else if (isIndexOpen && isMiddleOpen && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    } else if (!isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    } else if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);
      if (isCrossed) {
        detected = 'R';
      } else if (normThumbMiddle < 0.38 || this.dist(thumbTip, middlePIP) / handScale < 0.38) {
        detected = 'K';
      } else if (normIndexMiddle < 0.24) {
        detected = 'U';
      } else {
        detected = 'V';
      }
    } else if (extIndex >= 1.02 && isIndexHooked && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    } else if (!isIndexOpen && !isMiddleOpen && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && normThumbPinky > 0.55 && extThumb > 0.65;
      const isJTracingMotion = pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06 && pinkyDisplacementX + pinkyDisplacementY > 0.12;

      if (isThumbOutY) {
        detected = 'Y';
      } else if (isJTracingMotion) {
        detected = 'J';
      } else {
        detected = 'I';
      }
    } else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    } else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }

  classifyMobileLandmarks(
    rawLandmarks: Point3D[],
    isRearCamera = false,
    history: LandmarkHistoryItem[] = [],
    videoWidth = 720,
    videoHeight = 1280
  ): string {
    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    const needsMirroring = isRearCamera
      ? rawLandmarks[2].x < rawLandmarks[17].x
      : rawLandmarks[2].x > rawLandmarks[17].x;

    const normalizedLandmarks = needsMirroring
      ? rawLandmarks.map((p) => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
      : rawLandmarks;

    const aspect = videoWidth > 0 && videoHeight > 0 ? videoWidth / videoHeight : 0.5625;
    const landmarks = normalizedLandmarks.map((p) => ({
      x: p.x * aspect,
      y: p.y,
      z: p.z * aspect,
    }));

    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middleDIP = landmarks[11], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringDIP = landmarks[15], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyDIP = landmarks[19], pinkyPIP = landmarks[18], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.30;
    const isMiddleStraight = extMiddle > 1.30;
    const isRingStraight = extRing > 1.30;
    const isPinkyStraight = extPinky > 1.30;

    const isIndexOpen = extIndex > 1.08;
    const isMiddleOpen = extMiddle > 1.08;
    const isRingOpen = extRing > 1.08;
    const isPinkyOpen = extPinky > 0.98;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;
    const normIndexMiddle = this.dist(indexTip, middleTip) / handScale;

    const isPointingDown = isIndexOpen && indexTip.y > wrist.y + 0.12 * handScale && indexTip.y > indexMCP.y + 0.12 * handScale;
    const isHorizontal = Math.abs(indexTip.y - indexMCP.y) < 0.3 * handScale && Math.abs(indexTip.x - indexMCP.x) > 0.35 * handScale;
    const isIndexHooked = this.dist(indexTip, wrist) < 0.95 * this.dist(indexPIP, wrist) || (indexTip.y > indexDIP.y && indexTip.y > indexPIP.y);

    let indexDisplacementX = 0, indexDisplacementY = 0;
    let pinkyDisplacementX = 0, pinkyDisplacementY = 0;

    if (history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest.length >= 21) {
        indexDisplacementX = Math.abs(indexTip.x - oldest[8].x);
        indexDisplacementY = Math.abs(indexTip.y - oldest[8].y);
        pinkyDisplacementX = Math.abs(pinkyTip.x - oldest[20].x);
        pinkyDisplacementY = Math.abs(pinkyTip.y - oldest[20].y);
      }
    }

    let detected = 'A';

    if (isPointingDown && isIndexOpen) {
      if (isMiddleOpen) detected = 'P';
      else detected = 'Q';
    } else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleOpen && normIndexMiddle < 0.35) detected = 'H';
      else detected = 'G';
    } else if (
      normThumbIndex >= 0.38 && normThumbIndex <= 1.25 &&
      normThumbMiddle >= 0.38 && normThumbMiddle <= 1.25 &&
      extIndex >= 1.05 && extMiddle >= 1.05 &&
      extRing >= 0.75 && !isPointingDown
    ) {
      detected = 'C';
    } else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      if (distThumbMiddlePIP < 0.42 && distThumbIndexPIP < 0.42 && Math.abs(thumbTip.y - thumbIP.y) < 0.22 * handScale) {
        detected = 'S';
      } else if (normThumbIndex < 0.46 && normThumbMiddle < 0.46 && extIndex < 0.96 && extMiddle < 0.96) {
        detected = 'E';
      } else if (distThumbPinkyMCP < 0.42 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.40)) {
        detected = 'M';
      } else if (distThumbRingMCP < 0.40 && distThumbMiddleMCP < distThumbPinkyMCP) {
        detected = 'N';
      } else if (distThumbIndexMCP < 0.44 || (distThumbMiddleMCP < 0.44 && distThumbIndexMCP < distThumbRingMCP)) {
        detected = 'T';
      } else {
        detected = 'A';
      }
    } else if (isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    } else if (isIndexOpen && isMiddleOpen && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    } else if (!isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    } else if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);
      if (isCrossed) {
        detected = 'R';
      } else if (normThumbMiddle < 0.38 || this.dist(thumbTip, middlePIP) / handScale < 0.38) {
        detected = 'K';
      } else if (normIndexMiddle < 0.24) {
        detected = 'U';
      } else {
        detected = 'V';
      }
    } else if (extIndex >= 1.02 && isIndexHooked && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    } else if (!isIndexOpen && !isMiddleOpen && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && normThumbPinky > 0.55 && extThumb > 0.65;
      const isJTracingMotion = pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06 && pinkyDisplacementX + pinkyDisplacementY > 0.12;

      if (isThumbOutY) {
        detected = 'Y';
      } else if (isJTracingMotion) {
        detected = 'J';
      } else {
        detected = 'I';
      }
    } else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    } else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }
}

export class TTSEngine {
  private isMuted: boolean = false;

  speak(text: string, lang = 'en-US') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Synthesis error:', e);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
