#!/bin/bash
# Automated test script for Claude Computer Use integration
# This script automates the testing of the computer use functionality

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}Error: ANTHROPIC_API_KEY environment variable is not set${NC}"
    echo -e "Please set it with: ${YELLOW}export ANTHROPIC_API_KEY=your_api_key_here${NC}"
    exit 1
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}Testing Claude Computer Use Integration${NC}"
echo -e "${BLUE}==================================================${NC}"

# Function to make API calls
call_api() {
    local endpoint=$1
    local data=$2
    local description=$3
    
    echo -e "\n${YELLOW}$description...${NC}"
    
    # Make the API call
    response=$(curl -s -X POST "http://localhost:3000/api/tools/$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    # Check if the response contains an error
    if echo "$response" | grep -q "isError"; then
        echo -e "${RED}Failed:${NC} $(echo "$response" | grep -o '"text":"[^"]*"' | sed 's/"text":"//;s/"//')"
        return 1
    else
        echo -e "${GREEN}Success!${NC}"
        echo -e "${BLUE}Response:${NC} $(echo "$response" | grep -o '"text":"[^"]*"' | sed 's/"text":"//;s/"//' | head -1)"
        return 0
    fi
}

# Check if server is running
echo -e "\n${YELLOW}Checking if MCP server is running...${NC}"
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${RED}Error: MCP server is not running${NC}"
    echo -e "Please start it with: ${YELLOW}npm start${NC}"
    exit 1
fi
echo -e "${GREEN}MCP server is running!${NC}"

# API-Only Provider Tests
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${BLUE}Testing API-Only Provider${NC}"
echo -e "${BLUE}==================================================${NC}"

# Initialize API provider
call_api "initialize_computer" '{"type":"api"}' "Initializing API provider"
if [ $? -ne 0 ]; then exit 1; fi

# Use computer capabilities
call_api "use_computer" '{"prompt":"Create a text file named test.txt with the content \"Hello from AutoSpectra\" and then display its contents"}' "Using computer capabilities"
if [ $? -ne 0 ]; then exit 1; fi

# Clean up
call_api "cleanup_computer" '{}' "Cleaning up resources"
if [ $? -ne 0 ]; then exit 1; fi

# Smart Computer Use Tests
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${BLUE}Testing Smart Computer Use${NC}"
echo -e "${BLUE}==================================================${NC}"

# Initialize API provider again
call_api "initialize_computer" '{"type":"api"}' "Initializing API provider"
if [ $? -ne 0 ]; then exit 1; fi

# Test smart computer use
call_api "smart_computer_use" '{"prompt":"Navigate to https://example.com and take a screenshot of the page", "useAutomation":true}' "Testing smart computer use with automation fallback"
if [ $? -ne 0 ]; then exit 1; fi

# Clean up
call_api "cleanup_computer" '{}' "Cleaning up resources"
if [ $? -ne 0 ]; then exit 1; fi

# Container Provider Tests (if Docker is installed)
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${BLUE}Testing Container Provider${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found, skipping container tests.${NC}"
else
    echo -e "${GREEN}Docker is installed, proceeding with container tests.${NC}"
    
    # Initialize container provider
    call_api "initialize_computer" '{"type":"container", "width": 1280, "height": 800}' "Initializing container provider"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Container initialization failed, this might be expected if Docker is not properly configured.${NC}"
        echo -e "${YELLOW}Skipping remaining container tests.${NC}"
    else
        # Use computer capabilities with container
        call_api "use_computer" '{"prompt":"Open Firefox, navigate to wikipedia.org, and search for \"artificial intelligence\""}' "Using container computer capabilities"
        
        # Clean up
        call_api "cleanup_computer" '{}' "Cleaning up container resources"
    fi
fi

# Summary
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}Testing completed!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "For more testing options, please refer to ${YELLOW}TESTING_GUIDE.md${NC}"
