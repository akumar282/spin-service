//
//  HomeViewModel.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/30/26.
//
import SwiftUI

@Observable
class HomeViewModel {
    
    var recordsData: [Record] = []
    var upcomingReleaseData: [UpcomingRelease] = []
    var isLoadingRecords: Bool = false
    var isLoadingUpcoming: Bool = false
    
    var apiClient = SpinAPIClient()
    
    
    func getRecords() async {
        do {
            recordsData = try await apiClient.getRecords().items
        } catch {
            print("API call failed")
        }
    }
    
    
    func getUpcoming() async {
        do {
            upcomingReleaseData = try await apiClient.getUpcoming().items
        } catch {
            print("API call failed")
        }
    }
    
    
}
