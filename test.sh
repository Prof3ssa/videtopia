#!/bin/bash

# Videtopia Test Script
# This script tests the basic functionality of Videtopia

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test health endpoint
test_health() {
    print_status "Testing health endpoint..."
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        print_success "Health endpoint is working"
        return 0
    else
        print_error "Health endpoint failed"
        return 1
    fi
}

# Test frontend
test_frontend() {
    print_status "Testing frontend..."
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is accessible"
        return 0
    else
        print_error "Frontend is not accessible"
        return 1
    fi
}

# Test upload endpoint (should return error for no file, but endpoint should exist)
test_upload_endpoint() {
    print_status "Testing upload endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/upload)
    if [ "$response" = "400" ]; then
        print_success "Upload endpoint is working (returns 400 for no file - expected)"
        return 0
    else
        print_error "Upload endpoint returned unexpected status: $response"
        return 1
    fi
}

# Test with a sample video file
test_video_upload() {
    print_status "Testing video upload..."
    
    # Create a small test video file (1 second of black video)
    if command -v ffmpeg &> /dev/null; then
        ffmpeg -f lavfi -i color=c=black:size=320x240:duration=1 -c:v libx264 -pix_fmt yuv420p test_video.mp4 -y >/dev/null 2>&1
        
        # Upload the test video
        response=$(curl -s -X POST http://localhost:3001/api/upload -F "video=@test_video.mp4;type=video/mp4")
        
        if echo "$response" | grep -q "file_id"; then
            print_success "Video upload test passed"
            file_id=$(echo "$response" | grep -o '"file_id":"[^"]*"' | cut -d'"' -f4)
            print_status "Uploaded file ID: $file_id"
            
            # Clean up test file
            rm -f test_video.mp4
            return 0
        else
            print_error "Video upload test failed: $response"
            rm -f test_video.mp4
            return 1
        fi
    else
        print_status "FFmpeg not available, skipping video upload test"
        return 0
    fi
}

# Main test function
run_tests() {
    print_status "Starting Videtopia tests..."
    echo ""
    
    local tests_passed=0
    local tests_total=0
    
    # Run tests
    tests_total=$((tests_total + 1))
    if test_health; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_frontend; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_upload_endpoint; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_video_upload; then
        tests_passed=$((tests_passed + 1))
    fi
    
    echo ""
    print_status "Test Results: $tests_passed/$tests_total tests passed"
    
    if [ $tests_passed -eq $tests_total ]; then
        print_success "All tests passed! Videtopia is working correctly."
        return 0
    else
        print_error "Some tests failed. Check the logs for more details."
        return 1
    fi
}

# Check if services are running
check_services() {
    if ! sudo docker-compose ps | grep -q "Up"; then
        print_error "Videtopia services are not running. Please run 'sudo docker-compose up -d' first."
        exit 1
    fi
}

# Main script
main() {
    check_services
    run_tests
}

main "$@"
