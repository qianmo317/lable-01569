#!/bin/bash

# 校园二手物品交易平台 API 测试脚本
# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TOKEN=""

# 打印分隔线
print_separator() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 打印结果
print_result() {
    echo -e "${GREEN}响应:${NC}"
    echo "$1" | jq . 2>/dev/null || echo "$1"
    echo ""
}

# 检查健康状态
health_check() {
    print_separator
    echo -e "${YELLOW}🏥 健康检查${NC}"
    result=$(curl -s "$BASE_URL/health")
    print_result "$result"
}

# 用户登录
login() {
    local username=${1:-testuser}
    local password=${2:-test123}
    print_separator
    echo -e "${YELLOW}🔐 用户登录 (用户名: $username)${NC}"
    result=$(curl -s -X POST "$BASE_URL/api/users/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    print_result "$result"
    
    # 提取 token (优先用 jq，否则用 grep/sed)
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$result" | jq -r '.data.token // empty' 2>/dev/null)
    else
        # 备用方案：用 grep 和 sed 提取 token
        TOKEN=$(echo "$result" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
    fi
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Token 已保存，后续请求将自动携带认证信息${NC}"
        echo -e "Token: ${TOKEN:0:50}..."
    else
        echo -e "${RED}❌ 登录失败，未能获取 Token${NC}"
    fi
}

# 用户注册
register() {
    print_separator
    echo -e "${YELLOW}📝 用户注册${NC}"
    local username="user_$(date +%s)"
    result=$(curl -s -X POST "$BASE_URL/api/users/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"email\":\"$username@campus.edu\",\"password\":\"password123\"}")
    print_result "$result"
}

# 获取个人信息
get_profile() {
    print_separator
    echo -e "${YELLOW}👤 获取个人信息${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s "$BASE_URL/api/users/profile/me" \
        -H "Authorization: Bearer $TOKEN")
    print_result "$result"
}

# 获取分类列表
get_categories() {
    print_separator
    echo -e "${YELLOW}📂 获取所有分类${NC}"
    result=$(curl -s "$BASE_URL/api/categories")
    print_result "$result"
}

# 搜索物品
search_items() {
    local keyword=${1:-""}
    print_separator
    echo -e "${YELLOW}🔍 搜索物品 (关键词: $keyword)${NC}"
    result=$(curl -s "$BASE_URL/api/items/search?keyword=$keyword")
    print_result "$result"
}

# 发布物品
create_item() {
    print_separator
    echo -e "${YELLOW}📦 发布物品${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s -X POST "$BASE_URL/api/items" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "title": "测试商品 '"$(date +%H%M%S)"'",
            "description": "这是一个测试商品描述",
            "price": 99.99,
            "condition": "good",
            "categoryId": 1
        }')
    print_result "$result"
}

# 获取我的物品
get_my_items() {
    print_separator
    echo -e "${YELLOW}📋 获取我的物品${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s "$BASE_URL/api/items/user/my-items" \
        -H "Authorization: Bearer $TOKEN")
    print_result "$result"
}

# 搜索共享资源
search_resources() {
    local keyword=${1:-""}
    print_separator
    echo -e "${YELLOW}🔍 搜索共享资源 (关键词: $keyword)${NC}"
    result=$(curl -s "$BASE_URL/api/resources/search?keyword=$keyword")
    print_result "$result"
}

# 发布共享资源
create_resource() {
    print_separator
    echo -e "${YELLOW}📚 发布共享资源${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s -X POST "$BASE_URL/api/resources" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "title": "测试共享资源 '"$(date +%H%M%S)"'",
            "description": "可借用的测试资源",
            "categoryId": 5,
            "depositAmount": 50,
            "borrowDurationDays": 7
        }')
    print_result "$result"
}

# 获取我的交易
get_my_transactions() {
    print_separator
    echo -e "${YELLOW}💰 获取我的交易${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s "$BASE_URL/api/transactions/my-transactions" \
        -H "Authorization: Bearer $TOKEN")
    print_result "$result"
}

# 获取会话列表
get_conversations() {
    print_separator
    echo -e "${YELLOW}💬 获取会话列表${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s "$BASE_URL/api/messages/conversations" \
        -H "Authorization: Bearer $TOKEN")
    print_result "$result"
}

# 获取未读消息数
get_unread_count() {
    print_separator
    echo -e "${YELLOW}📬 获取未读消息数${NC}"
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 请先登录${NC}"
        return
    fi
    result=$(curl -s "$BASE_URL/api/messages/unread-count" \
        -H "Authorization: Bearer $TOKEN")
    print_result "$result"
}

# 显示菜单
show_menu() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║       🏫 校园二手物品交易平台 API 测试工具                     ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  当前状态: $([ -n "$TOKEN" ] && echo "✅ 已登录" || echo "❌ 未登录")                                         ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  [0] 🏥 健康检查                                               ║"
    echo "║  [1] 🔐 登录 (testuser)                                        ║"
    echo "║  [2] 🔐 登录 (admin)                                           ║"
    echo "║  [3] 📝 注册新用户                                              ║"
    echo "║  [4] 👤 获取个人信息                                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  [5] 📂 获取所有分类                                            ║"
    echo "║  [6] 🔍 搜索物品                                               ║"
    echo "║  [7] 📦 发布物品                                               ║"
    echo "║  [8] 📋 获取我的物品                                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  [9] 🔍 搜索共享资源                                            ║"
    echo "║ [10] 📚 发布共享资源                                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║ [11] 💰 获取我的交易                                            ║"
    echo "║ [12] 💬 获取会话列表                                            ║"
    echo "║ [13] 📬 获取未读消息数                                          ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║ [99] 🚀 运行全部测试                                            ║"
    echo "║  [q] 退出                                                      ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 运行全部测试
run_all_tests() {
    health_check
    login "testuser" "test123"
    get_profile
    get_categories
    search_items ""
    create_item
    get_my_items
    search_resources ""
    create_resource
    get_my_transactions
    get_conversations
    get_unread_count
    echo -e "${GREEN}✅ 全部测试完成！${NC}"
}

# 主循环
main() {
    while true; do
        show_menu
        echo -n "请选择操作: "
        read choice
        
        case $choice in
            0) health_check ;;
            1) login "testuser" "test123" ;;
            2) login "admin" "admin123" ;;
            3) register ;;
            4) get_profile ;;
            5) get_categories ;;
            6) 
                echo -n "请输入搜索关键词 (直接回车搜索全部): "
                read keyword
                search_items "$keyword"
                ;;
            7) create_item ;;
            8) get_my_items ;;
            9)
                echo -n "请输入搜索关键词 (直接回车搜索全部): "
                read keyword
                search_resources "$keyword"
                ;;
            10) create_resource ;;
            11) get_my_transactions ;;
            12) get_conversations ;;
            13) get_unread_count ;;
            99) run_all_tests ;;
            q|Q) echo "再见！"; exit 0 ;;
            *) echo -e "${RED}无效选择${NC}" ;;
        esac
        
        echo ""
        echo -n "按回车键继续..."
        read
    done
}

# 检查依赖
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}提示: 安装 jq 可以获得更好的 JSON 格式化输出 (brew install jq)${NC}"
fi

# 运行
main
