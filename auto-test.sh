#!/bin/bash
# Pawodoro Auto-Test Loop
# Runs build + tests every 5 minutes until 9:00 AM

END_HOUR=9
END_MIN=0

echo "🔄 Pawodoro Auto-Test Loop started at $(date '+%H:%M:%S')"
echo "   Will stop at ${END_HOUR}:${END_MIN:0:2}"

while true; do
  CURRENT_HOUR=$(date '+%H')
  CURRENT_MIN=$(date '+%M')
  
  if [ "$CURRENT_HOUR" -ge "$END_HOUR" ] && [ "$CURRENT_MIN" -ge "$END_MIN" ]; then
    echo "✅ Reached ${END_HOUR}:${END_MIN:0:2}, stopping loop."
    break
  fi
  
  echo ""
  echo "═══════════════════════════════════════════"
  echo "  Test Run: $(date '+%H:%M:%S')"
  echo "═══════════════════════════════════════════"
  
  cd /Users/awen/.qclaw/workspace-agent-5876a32a/pomodoro-extension
  
  # Build
  echo ""
  echo "📦 Building..."
  BUILD_OUTPUT=$(npx vite build 2>&1)
  BUILD_EXIT=$?
  
  if [ $BUILD_EXIT -ne 0 ]; then
    echo "❌ BUILD FAILED"
    echo "$BUILD_OUTPUT" | tail -10
  else
    echo "✅ Build passed"
    echo "$BUILD_OUTPUT" | tail -3
  fi
  
  # Tests
  echo ""
  echo "🧪 Running tests..."
  TEST_OUTPUT=$(npx vitest run 2>&1)
  TEST_EXIT=$?
  
  if [ $TEST_EXIT -ne 0 ]; then
    echo "❌ TESTS FAILED"
    echo "$TEST_OUTPUT" | tail -20
  else
    echo "✅ Tests passed"
    echo "$TEST_OUTPUT" | tail -3
  fi
  
  # Size check
  echo ""
  echo "📏 Bundle sizes:"
  ls -la dist/assets/*.js dist/assets/*.css 2>/dev/null | awk '{print "  " $5 " " $9}'
  
  # Next run time
  NEXT_MIN=$((CURRENT_MIN + 5))
  NEXT_HOUR=$CURRENT_HOUR
  if [ $NEXT_MIN -ge 60 ]; then
    NEXT_MIN=$((NEXT_MIN - 60))
    NEXT_HOUR=$((NEXT_HOUR + 1))
  fi
  echo ""
  echo "⏰ Next test at: $(printf '%02d:%02d' $NEXT_HOUR $NEXT_MIN)"
  
  sleep 300
done
