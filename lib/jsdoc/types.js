// Session
/**
 * @typedef {Object} UserSessionObject
 * @property {string} customToken
 * @property {string} email
 * @property {array} leagues
 * @property {string} name
 * @property {string} team
 * @property {string} uid
 * @property {string} username
 */

/**
 * @typedef {Object} DraftSession
 * @property {UserSessionObject|*} user - the user's session cookie returned from the server
 * @property {Date|*} expires - the authentication expiration date of the session cookie
 */

/**
 * @typedef {'loading'|'authenticated'|'unauthenticated'} SessionAuthStatus
 */

// Responses
//----------Roster Rules/Draft Response
/**
 * @typedef {Object} RulesResponse
 * @property {string} NAME,
 * @property {draftConfig} draft,
 * @property {rosterConfig} roster_construction,
 * @property {scoringConfig} scoring
 */

//----------Get User Response
/**
 * @typedef {Object} GetUserRsponse
 * @property {string} EMAIL,
 * @property {Object} leagues,
 * @property {string} PASSWORD,
 * @property {string} TEAM_MOTO,
 * @property {string} TEAM_NAME,
 * @property {string} USERNAME
 */

// League Draft
/**
 * @typedef {'snake'|'auction'|'regular'} DraftTypes
 */

/**
 * @typedef {Object} LeagueDraftRules
 * @property {string} COMMISSIONER
 * @property {number} CURRENT_DRAFT_POSITION
 * @property {Array<string>} DRAFT_ORDER
 * @property {Array<string>} [DRAFT_SELECTIONS]
 * @property {string} START
 * @property {string} TIMESTAMP_OF_LAST_SELECTION
 * @property {string} TIME_PER_SELECTION
 */

/**
 * @typedef {Object} draftConfig
 * @property {string} NAME,
 * @property {DraftTypes} draftStyle,
 * @property {number} numberOfRounds,
 * @property {number} numberOfTeamToApprove,
 * @property {boolean} tradesAllowed,
 * @property {boolean} tradesRequireLeagueApproval
 */

/**
 * @typedef {Object} draftPlayerConfig
 * @property {DraftTypes} DEFENSIVE_INT,
 * @property {number} FF,
 * @property {number} FR,
 * @property {number} FPTS,
 * @property {number} FPTSG,
 * @property {number} FR,
 * @property {number} GP,
 * @property {string} NAME,
 * @property {number} PASSING_INT,
 * @property {number} PASSING_TD,
 * @property {number} PASSING_YDS,
 * @property {number} RUSHING_TD,
 * @property {number} RUSHING_YDS,
 * @property {number} SCK,
 * @property {string} TEAM
 */

// Roster
/**
 * @typedef {Object} draftedRoster
 * @property {Object.<string, string>} [QB]
 * @property {Object.<string, string>} [RB]
 * @property {Object.<string, string>} [WR]
 * @property {Object.<string, string>} [TE]
 * @property {Object.<string, string>} [FLEX]
 * @property {Object.<string, string>} [OP]
 * @property {Object.<string, string>} [DEF]
 * @property {Object.<string, string>} [K]
 * @property {Object.<string, string>} [BENCH]
 */

//----------Roster Construction Config
/**
 * @typedef {Object} rosterConfig
 * @property {string} NAME,
 * @property {number} benchPlayersAllowed,
 * @property {boolean} injuredReservedAllowed,
 * @property {number} numberOfIR,
 * @property {positionConfig} positionMaxAllowed,
 * @property {positionConfig} starterPositions,
 * @property {number} totalNumberOfPlayersAllowed
 */

/**
 * @typedef {Object} positionConfig
 * @property {number} DEF
 * @property {number} FLEX
 * @property {number} K
 * @property {number} QB
 * @property {number} RB
 * @property {number} WR
 * @property {number} TE
 */

// Scoring
/**
 * @typedef {Object} scoringConfig
 * @property {string} NAME,
 * @property {defenseScoringConfig} defense,
 * @property {passingScoringConfig} passing,
 * @property {recScoringConfig} rec,
 * @property {rusingScoringConfig} rushing,
 * @property {specialTeamScoringConfig} specialTeams
 */

//----------Defense
/**
 * @typedef {Object} defensePTSConfig
 * @property {number} 0,
 * @property {number} 3,
 * @property {number} 7,
 * @property {number} 14,
 * @property {number} 28,
 * @property {number} 35,
 * @property {number} 42,
 * @property {number} >45
 */

/**
 * @typedef {Object} defenseYRDConfig
 * @property {number} 250,
 * @property {number} 300,
 * @property {number} 350,
 * @property {number} 400,
 * @property {number} 450,
 * @property {number} 500,
 * @property {number} >550
 */

/**
 * @typedef {Object} defenseScoringConfig
 * @property {number} FF,
 * @property {number} FR,
 * @property {number} INT,
 * @property {number} TD,
 * @property {number} TFL,
 * @property {defensePTSConfig} UNDER_PTS,
 * @property {defenseYRDConfig} UNDER_YRD,
 * @property {number} blockFG,
 * @property {number} blockedPunt,
 * @property {number} sack,
 * @property {number} tackle
 */

//----------Passing
/**
 * @typedef {Object} passingScoringConfig
 * @property {number} INT,
 * @property {number} TD,
 * @property {number} fumbles,
 * @property {number} isPPCon,
 * @property {number} ptsPerCompletion,
 * @property {number} yardsPerPt
 */

//----------Receiving
/**
 * @typedef {Object} recScoringConfig
 * @property {number} TD,
 * @property {number} drops,
 * @property {number} fumbles,
 * @property {number} isPPR,
 * @property {number} ptsPerRec,
 * @property {number} yardsPerPt
 */

/**
 * @typedef {Object} rusingScoringConfig
 * @property {number} TD,
 * @property {number} fumbles,
 * @property {number} isPPCar,
 * @property {number} ptsPerCarry,
 * @property {number} yardsPerPt
 */

//----------Rushing
/**
 * @typedef {Object} fgDistanceConfig
 * @property {number} 30,
 * @property {number} 40,
 * @property {number} 50,
 * @property {number} >55
 */

//----------Special Teams
/**
 * @typedef {Object} specialTeamScoringConfig
 * @property {number} blockedFG,
 * @property {number} blockedPunt,
 * @property {fgDistanceConfig} distanceBonus,
 * @property {number} fgMade,
 * @property {number} krYardsPerPt,
 * @property {number} prYardsPerPt
 */

// Utils
/**
 * @typedef {[string, string]} playerPositionConfig
 */

/**
 * @typedef {Array<playerPositionConfig>} draftPlayerInfo
 */


module.exports = {};