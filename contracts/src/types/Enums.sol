// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

enum Faculty { 
    Science, 
    Engineering, 
    Arts, 
    Medicine, 
    Law, 
    SocialSciences, 
    Education, 
    Agriculture,
    Management,
    Technology
}

enum InstitutionType {
    University,
    Polytechnic,
    CollegeOfEducation,
    TechnicalCollege,
    SecondarySchool,
    PrimarySchool,
    TrainingInstitute,
    VocationalCenter
}

enum Classification {
    FirstClass,
    SecondClassUpper,
    SecondClassLower,
    ThirdClass,
    Pass,
    Distinction,
    Credit,
    Merit
}

enum VerificationStatus {
    Unverified,
    Verified,
    Pending,
    Rejected
}