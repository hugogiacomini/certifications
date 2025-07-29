#!/bin/bash

# HuGoLearn Platform Launcher
echo "🎓 Starting HuGoLearn - Interactive Certification Learning Platform"
echo "=================================================="

# Check if we're on Windows, macOS, or Linux and open accordingly
if command -v cmd.exe &> /dev/null; then
    # Windows (including WSL)
    echo "Opening on Windows..."
    cmd.exe /c start index.html
elif command -v open &> /dev/null; then
    # macOS
    echo "Opening on macOS..."
    open index.html
elif command -v xdg-open &> /dev/null; then
    # Linux
    echo "Opening on Linux..."
    xdg-open index.html
else
    echo "Please open index.html in your web browser manually"
    echo "File location: $(pwd)/index.html"
fi

echo ""
echo "🚀 HuGoLearn Features:"
echo "  📚 Interactive Flashcards"
echo "  🧠 Practice Tests & Mock Exams"
echo "  📊 Progress Tracking & Analytics"
echo "  🎯 Study Plan Generation"
echo "  🏆 Achievement System"
echo ""
echo "📖 Available Certifications:"
echo "  🟧 AWS Solutions Architect Associate"
echo "  🟧 AWS Data Engineer Associate"
echo "  🟪 Databricks Data Engineer Associate"
echo "  🟪 Databricks Data Engineer Professional"
echo "  🟪 Databricks Generative AI Engineer"
echo "  🟦 Azure Fundamentals (AZ-900)"
echo "  ☁️ Google Cloud Professional Data Engineer"
echo "  🔄 Professional Scrum Master I & II"
echo "  🔄 Professional Product Owner I"
echo ""
echo "Happy learning! 🎉"
