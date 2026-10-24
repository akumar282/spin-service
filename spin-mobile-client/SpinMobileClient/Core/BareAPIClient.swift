//
//  APIClient.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/23/26.
//

import Foundation

struct BareAPIClient {
    
    let baseUrl: URL
    var headers: [String: String]
    var useCredentials: Bool
    
    func get<T: Decodable>(resource: String, queryParams: [URLQueryItem] = []) async throws -> ResponseData<T>  {
        let request = URLRequest(url: baseUrl.appending(path: resource).appending(queryItems: queryParams))
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let apiResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        let decoded = try JSONDecoder().decode(T.self, from: data)
        
        return ResponseData(statusCode: apiResponse.statusCode, data: decoded)
    }
}
