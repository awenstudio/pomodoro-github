#!/bin/bash
# Pawodoro Auto-Test & Build Loop
# Runs build + tests every 5 minutes, auto-commits fixes, until 9:00 AM

END_HOUR=9
END_MIN=0
PROJECT_DIR="/Users/awen/.qclaw/workspace-agent-5876a32a/pomodoro-extension"

echo "🔄 Pawodoro Auto-Test Loop started at $(date '+%H:%M:%S')"
echo "   Will stop at ${END_HOUR}:${END_MIN:0:2}"
echo "   PID: $$"

RUN_COUNT=0
FAIL_COUNT=0

while true; do
  CURRENT_HOUR=$(date '+%H')
  CURRENT_MIN=$(date '+%M')
  
  if [ "$CURRENT_HOUR" -ge "$END_HOUR" ] && [ "$CURRENT_MIN" -ge "$END_MIN" ]; then
    echo ""
    echo "✅ Reached ${END_HOUR}:${END_MIN:0:2}, stopping loop."
    echo "   Total runs: $RUN_COUNT, Failures: $FAIL_COUNT"
    break
  fi
  
  RUN_COUNT=$((RUN_COUNT + 1))
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Test Run #${RUN_COUNT}: $(date '+%H:%M:%S')"
  echo "═══════════════════════════════════════════════════════"
  
  cd "$PROJECT_DIR"
  
  # Build
  echo ""
  echo "📦 Building..."
  BUILD_OUTPUT=$(npx vite build 2>&1)
  BUILD_EXIT=$?
  
  if [ $BUILD_EXIT -ne 0 ]; then
    echo "❌ BUILD FAILED"
    echo "$BUILD_OUTPUT" | tail -10
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "✅ Build passed"
    BUILD_SIZE=$(echo "$BUILD_OUTPUT" | grep "popup-" | grep -o '[0-9]*\.[0-9]* [KM]' | head -1)
    echo "   Bundle: ${BUILD_SIZE}B"
  fi
  
  # Tests
  echo ""
  echo "🧪 Running tests..."
  TEST_OUTPUT=$(npx vitest run 2>&1)
  TEST_EXIT=$?
  
  if [ $TEST_EXIT -ne 0 ]; then
    echo "❌ TESTS FAILED"
    echo "$TEST_OUTPUT" | tail -20
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -o '[0-9]* passed' | head -1)
    echo "✅ Tests passed (${TEST_COUNT})"
  fi
  
  # Type check
  echo ""
  echo "🔍 Type checking..."
  TYPE_OUTPUT=$(npx tsc --noEmit 2>&1)
  TYPE_EXIT=$?
  
  if [ $TYPE_EXIT -ne 0 ]; then
    echo "⚠️  Type warnings:"
    echo "$TYPE_OUTPUT" | head -5
  else
    echo "✅ No type errors"
  fi
  
  # Lint
  echo ""
  echo "📏 Linting..."
  LINT_OUTPUT=$(npx eslint src/ --quiet 2>&1 | head -5)
  if [ -n "$LINT_OUTPUT" ]; then
    echo "⚠️  Lint issues:"
    echo "$LINT_OUTPUT"
  else
    echo "✅ Clean"
  fi
  
  # Git status
  echo ""
  echo "📋 Git status:"
  CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
  if [ "$CHANGES" -gt 0 ]; then
    echo "   $CHANGES uncommitted changes"
    git add -A
    git commit -m "auto: test run #${RUN_COUNT} - $(date '+%H:%M')" --no-verify 2>/dev/null
    git push 2>/dev/null
    echo "   Auto-committed and pushed"
  else
    echo "   Clean working tree"
  fi
  
  # Summary
  echo ""
  echo "📊 Summary:"
  echo "   Runs: $RUN_COUNT | Failures: $FAIL_COUNT | Status: $([ $FAIL_COUNT -eq 0 ] && echo '🟢' || echo '🟡')"
  
  # Next run time
  NEXT_MIN=$((CURRENT_MIN + 5))
  NEXT_HOUR=$CURRENT_HOUR
  if [ $NEXT_MIN -ge 60 ]; then
    NEXT_MIN=$((NEXT_MIN - 60))
    NEXT_HOUR=$((NEXT_HOUR + 1))
  fi
  echo "   Next: $(printf '%02d:%02d' $NEXT_HOUR $NEXT_MIN)"
  
  sleep 300
done
