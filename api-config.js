// Bed24 API Configuration and Integration
// 보안을 위해 환경변수나 서버사이드에서 관리해야 하는 토큰들

class Bed24APIManager {
    constructor() {
        // 암호화된 토큰들 (실제 환경에서는 서버사이드에서 관리)
        this.encryptedTokens = {
            invite: 'GsqlYx2DP27KpyxA6/hhvxsOOBfhqYF21MzTc83/4zioeua4VgtOepGdRyDsf6Pdocz6WRAit8uGQ+uv5Q5MYLkIBScSpa1B3AvK1GPGqll1BYh5G0464DDMkeFL6p4/KSLvkSWVB9uTUBpuLs3O3TTYHyrzXdi9BUideVnpU8Q=',
            access_token: '46sl/KxzVF7CbbimeEpFsY5r/9bJcxvzw6rSOZbk6Az5moXqLI8nZZl2cSRdETBsXcVAeb8i/EzDbUr3IcG3Eap4H5W9PmN9Qoeat31Yc4jSi+Wlv3pagjdaWFfwwfQYs/hP0Q7hmL4LRFew0nQZ4w==',
            refresh_token: 'Xrr4HyvOW+WNMYA3EPxYPQLIQgnlBINfbTX67H/6wdMkj56TCIUFBTiC2LjxRJmlK9QYyoatxodgKDlbeRevyYDIwjsbWcBZUxCPxIp/AftJZaXd94c0p8j5DXSvFu0ovxM9oo35fy5/NU2FKZjZAJW23x6oKS0romwOvxjehIQ='
        };
        
        this.baseURL = 'https://beds24.com/api/v2';
        this.propertyIds = {
            'dada': '12345',
            'jgarden': '12346'
        };
        
        this.isAuthenticated = false;
        this.authToken = null;
        this.tokenExpiryTime = null;
    }

    // 토큰 복호화 (실제로는 서버사이드에서 처리)
    decryptToken(encryptedToken) {
        // 실제 구현에서는 적절한 복호화 알고리즘 사용
        // 여기서는 단순화를 위해 base64 디코딩 예시
        try {
            return atob(encryptedToken);
        } catch (error) {
            console.error('토큰 복호화 실패:', error);
            return null;
        }
    }

    // API 인증
    async authenticate() {
        try {
            const response = await fetch(`${this.baseURL}/authentication`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: 'your_bed24_username',
                    password: 'your_bed24_password',
                    invite: this.encryptedTokens.invite
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.token) {
                this.authToken = data.token;
                this.tokenExpiryTime = Date.now() + (data.expires_in * 1000);
                this.isAuthenticated = true;
                
                // 토큰을 안전하게 저장 (실제로는 httpOnly 쿠키 사용 권장)
                this.saveTokenSecurely(data.token);
                
                return true;
            }
            
            throw new Error('No token received');
            
        } catch (error) {
            console.error('API 인증 실패:', error);
            this.isAuthenticated = false;
            throw error;
        }
    }

    // 토큰 새로고침
    async refreshToken() {
        try {
            const response = await fetch(`${this.baseURL}/authentication/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    refresh_token: this.encryptedTokens.refresh_token
                })
            });

            const data = await response.json();
            
            if (data.token) {
                this.authToken = data.token;
                this.tokenExpiryTime = Date.now() + (data.expires_in * 1000);
                this.saveTokenSecurely(data.token);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('토큰 새로고침 실패:', error);
            return false;
        }
    }

    // 토큰 보안 저장
    saveTokenSecurely(token) {
        // 실제 구현에서는 httpOnly 쿠키나 보안 저장소 사용
        // localStorage는 XSS 공격에 취약하므로 권장하지 않음
        sessionStorage.setItem('bed24_token', token);
    }

    // 저장된 토큰 로드
    loadStoredToken() {
        const token = sessionStorage.getItem('bed24_token');
        if (token && this.tokenExpiryTime > Date.now()) {
            this.authToken = token;
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    // 토큰 만료 확인
    isTokenValid() {
        return this.authToken && this.tokenExpiryTime > Date.now();
    }

    // 인증된 API 요청
    async makeAuthenticatedRequest(endpoint, options = {}) {
        // 토큰 유효성 확인
        if (!this.isTokenValid()) {
            if (!(await this.refreshToken())) {
                if (!(await this.authenticate())) {
                    throw new Error('인증 실패');
                }
            }
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const requestOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
        
        if (response.status === 401) {
            // 토큰 만료 시 재시도
            if (await this.refreshToken()) {
                requestOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
                return await fetch(`${this.baseURL}${endpoint}`, requestOptions);
            }
            throw new Error('인증이 만료되었습니다');
        }

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        return response;
    }

    // 예약 목록 가져오기
    async getBookings(propertyId = null, dateFrom = null, dateTo = null) {
        try {
            const params = new URLSearchParams();
            
            if (propertyId) params.append('propertyId', propertyId);
            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);
            
            const response = await this.makeAuthenticatedRequest(
                `/bookings?${params.toString()}`
            );
            
            return await response.json();
            
        } catch (error) {
            console.error('예약 목록 로드 실패:', error);
            throw error;
        }
    }

    // 특정 예약 정보 가져오기
    async getBooking(bookingId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/bookings/${bookingId}`);
            return await response.json();
        } catch (error) {
            console.error('예약 정보 로드 실패:', error);
            throw error;
        }
    }

    // 메시지 전송
    async sendMessage(bookingId, subject, message, guestEmail = null) {
        try {
            const messageData = {
                bookingId: bookingId,
                subject: subject,
                message: message,
                type: 'email'
            };

            if (guestEmail) {
                messageData.email = guestEmail;
            }

            const response = await this.makeAuthenticatedRequest('/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            });

            return await response.json();
            
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            throw error;
        }
    }

    // 메시지 히스토리 가져오기
    async getMessages(bookingId = null, propertyId = null) {
        try {
            const params = new URLSearchParams();
            
            if (bookingId) params.append('bookingId', bookingId);
            if (propertyId) params.append('propertyId', propertyId);
            
            const response = await this.makeAuthenticatedRequest(
                `/messages?${params.toString()}`
            );
            
            return await response.json();
            
        } catch (error) {
            console.error('메시지 히스토리 로드 실패:', error);
            throw error;
        }
    }

    // 속성(Property) 정보 가져오기
    async getProperty(propertyId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/properties/${propertyId}`);
            return await response.json();
        } catch (error) {
            console.error('속성 정보 로드 실패:', error);
            throw error;
        }
    }

    // 방 정보 가져오기
    async getRooms(propertyId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/properties/${propertyId}/rooms`);
            return await response.json();
        } catch (error) {
            console.error('방 정보 로드 실패:', error);
            throw error;
        }
    }

    // API 연결 상태 확인
    async checkConnection() {
        try {
            if (!this.isTokenValid()) {
                await this.authenticate();
            }
            
            const response = await this.makeAuthenticatedRequest('/properties');
            return response.ok;
            
        } catch (error) {
            console.error('연결 상태 확인 실패:', error);
            return false;
        }
    }

    // 에러 핸들링
    handleAPIError(error) {
        console.error('Bed24 API 에러:', error);
        
        if (error.message.includes('401')) {
            this.isAuthenticated = false;
            this.authToken = null;
            return '인증이 필요합니다. 다시 로그인해주세요.';
        }
        
        if (error.message.includes('403')) {
            return '접근 권한이 없습니다.';
        }
        
        if (error.message.includes('429')) {
            return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        if (error.message.includes('500')) {
            return 'Bed24 서버에 문제가 발생했습니다.';
        }
        
        return '알 수 없는 오류가 발생했습니다.';
    }
}

// 전역 API 매니저 인스턴스
window.bed24API = new Bed24APIManager();

// API 연동 확장 함수들
const APIIntegration = {
    // 초기화
    async initialize() {
        try {
            // 저장된 토큰 확인
            if (window.bed24API.loadStoredToken()) {
                console.log('저장된 토큰으로 인증됨');
                return true;
            }
            
            // 새로운 인증 시도
            await window.bed24API.authenticate();
            console.log('새로운 인증 완료');
            return true;
            
        } catch (error) {
            console.error('API 초기화 실패:', error);
            return false;
        }
    },

    // 호스텔별 예약 데이터 동기화
    async syncBookingData() {
        try {
            const allBookings = [];
            
            // 각 속성별로 예약 데이터 가져오기
            for (const [hostelKey, propertyId] of Object.entries(window.bed24API.propertyIds)) {
                const bookings = await window.bed24API.getBookings(propertyId);
                
                if (bookings && bookings.data) {
                    const processedBookings = bookings.data.map(booking => ({
                        ...booking,
                        hostelKey: hostelKey,
                        propertyId: propertyId
                    }));
                    
                    allBookings.push(...processedBookings);
                }
            }
            
            return allBookings;
            
        } catch (error) {
            console.error('예약 데이터 동기화 실패:', error);
            throw error;
        }
    },

    // 실시간 메시지 동기화
    async syncMessages() {
        try {
            const allMessages = {};
            
            for (const [hostelKey, propertyId] of Object.entries(window.bed24API.propertyIds)) {
                const messages = await window.bed24API.getMessages(null, propertyId);
                
                if (messages && messages.data) {
                    messages.data.forEach(message => {
                        const bookingId = message.bookingId;
                        if (!allMessages[bookingId]) {
                            allMessages[bookingId] = [];
                        }
                        allMessages[bookingId].push({
                            id: message.id,
                            type: message.direction === 'out' ? 'sent' : 'received',
                            content: message.message,
                            timestamp: message.created,
                            subject: message.subject
                        });
                    });
                }
            }
            
            return allMessages;
            
        } catch (error) {
            console.error('메시지 동기화 실패:', error);
            throw error;
        }
    }
};

// 보안 권장사항:
// 1. 실제 환경에서는 토큰을 서버사이드에서 관리
// 2. HTTPS 사용 필수
// 3. CORS 정책 적용
// 4. Rate Limiting 구현
// 5. 로그 모니터링
// 6. 토큰 갱신 자동화